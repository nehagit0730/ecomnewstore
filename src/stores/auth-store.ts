"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeOrderItemImage } from "@/lib/catalog-images";
import type { Address, Order, User } from "@/types/user";

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  register: (input: RegisterInput) => { success: boolean; error?: string };
  login: (input: LoginInput) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "firstName" | "lastName" | "phone" | "email">>) => void;
  addOrder: (order: Order) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
};

type StoredUserRecord = User & { password: string };

const USERS_STORAGE_KEY = "veloire-users-registry";

function loadRegistry(): StoredUserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const users = raw ? (JSON.parse(raw) as StoredUserRecord[]) : [];
    return users.map((u) => ({
      ...u,
      orders: u.orders.map(normalizeOrder),
    }));
  } catch {
    return [];
  }
}

function saveRegistry(users: StoredUserRecord[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      image: normalizeOrderItemImage(item),
    })),
  };
}

function normalizeUserOrders(user: User): User {
  return {
    ...user,
    orders: user.orders.map(normalizeOrder),
  };
}

function stripPassword(record: StoredUserRecord): User {
  const { password: _, ...user } = record;
  return normalizeUserOrders(user);
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      register: ({ email, password, firstName, lastName }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const registry = loadRegistry();

        if (registry.some((u) => u.email === normalizedEmail)) {
          return { success: false, error: "An account with this email already exists." };
        }

        const newUser: StoredUserRecord = {
          id: generateId("user"),
          email: normalizedEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: "",
          addresses: [],
          orders: [],
          password,
        };

        saveRegistry([...registry, newUser]);
        const user = stripPassword(newUser);
        set({ user, isAuthenticated: true });
        return { success: true };
      },

      login: ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const registry = loadRegistry();
        const match = registry.find(
          (u) => u.email === normalizedEmail && u.password === password
        );

        if (!match) {
          return { success: false, error: "Invalid email or password." };
        }

        saveRegistry(registry);
        set({ user: stripPassword(match), isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const { user } = get();
        if (!user) return;

        const registry = loadRegistry();
        const index = registry.findIndex((u) => u.id === user.id);
        if (index === -1) return;

        const updated: StoredUserRecord = {
          ...registry[index],
          ...data,
          email: data.email?.trim().toLowerCase() ?? registry[index].email,
        };
        registry[index] = updated;
        saveRegistry(registry);
        set({ user: stripPassword(updated) });
      },

      addOrder: (order) => {
        const { user } = get();
        if (!user) return;

        const registry = loadRegistry();
        const index = registry.findIndex((u) => u.id === user.id);
        if (index === -1) return;

        const updated: StoredUserRecord = {
          ...registry[index],
          orders: [normalizeOrder(order), ...registry[index].orders],
        };
        registry[index] = updated;
        saveRegistry(registry);
        set({ user: stripPassword(updated) });
      },

      addAddress: (address) => {
        const { user } = get();
        if (!user) return;

        const registry = loadRegistry();
        const index = registry.findIndex((u) => u.id === user.id);
        if (index === -1) return;

        const newAddress: Address = {
          ...address,
          id: generateId("addr"),
          isDefault:
            address.isDefault || registry[index].addresses.length === 0,
        };

        let addresses = [...registry[index].addresses, newAddress];
        if (newAddress.isDefault) {
          addresses = addresses.map((a) => ({
            ...a,
            isDefault: a.id === newAddress.id,
          }));
        }

        const updated: StoredUserRecord = { ...registry[index], addresses };
        registry[index] = updated;
        saveRegistry(registry);
        set({ user: stripPassword(updated) });
      },

      updateAddress: (id, patch) => {
        const { user } = get();
        if (!user) return;

        const registry = loadRegistry();
        const index = registry.findIndex((u) => u.id === user.id);
        if (index === -1) return;

        const addresses = registry[index].addresses.map((a) =>
          a.id === id ? { ...a, ...patch } : a
        );

        const updated: StoredUserRecord = { ...registry[index], addresses };
        registry[index] = updated;
        saveRegistry(registry);
        set({ user: stripPassword(updated) });
      },

      removeAddress: (id) => {
        const { user } = get();
        if (!user) return;

        const registry = loadRegistry();
        const index = registry.findIndex((u) => u.id === user.id);
        if (index === -1) return;

        let addresses = registry[index].addresses.filter((a) => a.id !== id);
        if (addresses.length && !addresses.some((a) => a.isDefault)) {
          addresses = addresses.map((a, i) => ({
            ...a,
            isDefault: i === 0,
          }));
        }

        const updated: StoredUserRecord = { ...registry[index], addresses };
        registry[index] = updated;
        saveRegistry(registry);
        set({ user: stripPassword(updated) });
      },

      setDefaultAddress: (id) => {
        const { user } = get();
        if (!user) return;

        const registry = loadRegistry();
        const index = registry.findIndex((u) => u.id === user.id);
        if (index === -1) return;

        const addresses = registry[index].addresses.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }));

        const updated: StoredUserRecord = { ...registry[index], addresses };
        registry[index] = updated;
        saveRegistry(registry);
        set({ user: stripPassword(updated) });
      },
    }),
    {
      name: "veloire-auth",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as {
          user?: User | null;
          isAuthenticated?: boolean;
        };
        if (state.user?.orders?.length) {
          state.user = normalizeUserOrders(state.user);
        }
        return state;
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
