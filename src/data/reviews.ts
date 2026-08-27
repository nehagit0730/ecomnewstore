export type CustomerReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  product: string;
  date: string;
  avatar?: string;
};

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "r1",
    name: "Arjun Mehta",
    rating: 5,
    text: "The fabric quality is exceptional. Fits perfectly and feels premium all day.",
    product: "Premium Cotton Crew Tee",
    date: "2025-05-12",
  },
  {
    id: "r2",
    name: "Priya Sharma",
    rating: 5,
    text: "Finally found innerwear that is comfortable and stylish. Will buy again!",
    product: "Seamless Comfort Bralette",
    date: "2025-05-08",
  },
  {
    id: "r3",
    name: "Rahul Verma",
    rating: 4,
    text: "Great joggers for workouts and casual wear. True to size.",
    product: "Performance Flex Joggers",
    date: "2025-04-28",
  },
  {
    id: "r4",
    name: "Ananya Iyer",
    rating: 5,
    text: "Love the minimalist design. Packaging was beautiful too.",
    product: "Linen Relaxed Shirt",
    date: "2025-04-15",
  },
];
