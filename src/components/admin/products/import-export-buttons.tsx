"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";

interface ImportExportButtonsProps {
  selectedIds?: string[];
  onImportComplete?: () => void;
}

export function ImportExportButtons({
  selectedIds = [],
  onImportComplete,
}: ImportExportButtonsProps) {
  const router = useRouter();
  const [importOpen, setImportOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{
    headers: string[];
    rowCount: number;
    sampleRows: string[][];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (isTemplate = false, exportSelected = false) => {
    try {
      setExporting(true);
      let url = "/api/admin/products/export";
      const params = new URLSearchParams();

      if (isTemplate) {
        params.set("template", "true");
      } else if (exportSelected && selectedIds.length > 0) {
        params.set("ids", selectedIds.join(","));
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      const dateStr = new Date().toISOString().split("T")[0];
      if (isTemplate) {
        a.download = "veloire-products-import-template.csv";
      } else if (exportSelected) {
        a.download = `products-selected-${selectedIds.length}-${dateStr}.csv`;
      } else {
        a.download = `veloire-products-catalog-${dateStr}.csv`;
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      if (isTemplate) {
        toast.success("Sample template downloaded");
      } else {
        toast.success(
          exportSelected
            ? `Exported ${selectedIds.length} selected products`
            : "Product catalog exported successfully"
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export products");
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);

    if (!selected) {
      setFilePreview(null);
      return;
    }

    try {
      const text = await selected.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0]
          .split(",")
          .map((h) => h.replace(/^"|"$/g, "").trim());
        const sampleRows = lines
          .slice(1, 4)
          .map((line) =>
            line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim())
          );
        setFilePreview({
          headers,
          rowCount: lines.length - 1,
          sampleRows,
        });
      }
    } catch {
      setFilePreview(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please choose a CSV or JSON file to import");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          `Successfully imported / updated ${data.imported} products!`
        );
        if (data.errors && data.errors.length > 0) {
          toast.warning(
            `Notice: ${data.errors.length} rows had warnings:\n${data.errors
              .slice(0, 2)
              .join("; ")}`
          );
        }
        setImportOpen(false);
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (onImportComplete) onImportComplete();
        router.refresh();
      } else {
        toast.error(data.error || "Failed to import products");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to upload and import products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Export Button */}
      <Button
        variant="outline"
        onClick={() => handleExport(false, false)}
        disabled={exporting}
        className="h-9 gap-2 shadow-xs"
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4 text-emerald-600" />
        )}
        <span>Export Catalog</span>
      </Button>

      {/* Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="h-9 gap-2 shadow-xs">
            <Upload className="h-4 w-4 text-blue-600" />
            <span>Import Products</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-serif">
                  Import Products
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Upload a CSV or JSON file to batch create or update products
                  with variants, prices, and stock.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Quick Template Download Card */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50">
              <div className="flex items-start gap-2.5">
                <FileText className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-950">
                    Need the formatted CSV template?
                  </p>
                  <p className="text-[11px] text-amber-800/80">
                    Download our ready-to-use spreadsheet with pre-populated
                    example rows & headers.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs shrink-0 bg-white border-amber-300 hover:bg-amber-100 text-amber-900"
                onClick={() => handleExport(true)}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Sample Template
              </Button>
            </div>

            {/* File Upload Dropzone */}
            <div className="border-2 border-dashed rounded-lg p-5 text-center hover:border-foreground/40 transition-colors bg-muted/20">
              <input
                ref={fileInputRef}
                id="product-import-file"
                type="file"
                accept=".csv, .json, text/csv, application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="product-import-file"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground underline">
                    Click to upload
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    or drag and drop
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    CSV or JSON files up to 10MB
                  </p>
                </div>
              </label>
            </div>

            {/* File Selection & Live Preview */}
            {file && (
              <div className="space-y-3 rounded-lg border p-3.5 bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB •{" "}
                        {filePreview?.rowCount ?? 0} rows detected
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Change File
                  </Button>
                </div>

                {/* Headers Preview */}
                {filePreview && filePreview.headers.length > 0 && (
                  <div className="pt-2 border-t text-xs">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                      Detected Columns ({filePreview.headers.length}):
                    </p>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {filePreview.headers.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-secondary text-[10px] rounded-md font-mono"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Guidelines */}
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p>
                Products with existing handles or SKUs will be automatically
                updated. New handles will create new product records with
                categories and initial stock.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImportOpen(false);
                  setFile(null);
                  setFilePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="luxury"
                onClick={handleImport}
                disabled={loading || !file}
                className="gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <FileCode2 className="h-3.5 w-3.5" />
                    <span>Start Import</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
