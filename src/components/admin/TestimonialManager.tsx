import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { testimonialApi, uploadApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Loader2,
  MessageSquare,
  Star,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Link,
} from "lucide-react";

export interface Testimonial {
  _id: string;
  message: string;
  review: number;
  user_name: string;
  user_address: string;
  user_image?: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const emptyForm = {
  message: "",
  review: 5,
  user_name: "",
  user_address: "",
  user_image: "",
};

const TestimonialManager = () => {
  const { toast } = useToast();
  const [list, setList] = useState<Testimonial[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const [form, setForm] = useState(emptyForm);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setForm((f) => ({ ...f, user_image: "" }));
    e.target.value = "";
  };

  const clearImageUpload = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const switchToUrl = () => {
    setImageMode("url");
    clearImageUpload();
  };

  const switchToUpload = () => {
    setImageMode("upload");
    setForm((f) => ({ ...f, user_image: "" }));
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await testimonialApi.list({ page, limit });
      setList(res.data || []);
      setTotal(res.total ?? 0);
    } catch (e) {
      toast({
        title: "Failed to load testimonials",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [page]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      let imageUrl = form.user_image || undefined;
      if (imageMode === "upload" && imageFile) {
        imageUrl = await uploadApi.uploadImage(imageFile);
      }
      await testimonialApi.add({
        message: form.message,
        review: form.review,
        user_name: form.user_name,
        user_address: form.user_address,
        user_image: imageUrl,
      });
      toast({ title: "Testimonial added", description: "New testimonial has been added." });
      setForm(emptyForm);
      clearImageUpload();
      loadList();
    } catch (e) {
      toast({
        title: "Failed to add testimonial",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEdit = (t: Testimonial) => {
    setEditId(t._id);
    setForm({
      message: t.message,
      review: t.review,
      user_name: t.user_name,
      user_address: t.user_address,
      user_image: t.user_image || "",
    });
    setImageMode("url");
    clearImageUpload();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSubmitLoading(true);
    try {
      let imageUrl = form.user_image || undefined;
      if (imageMode === "upload" && imageFile) {
        imageUrl = await uploadApi.uploadImage(imageFile);
      }
      await testimonialApi.update(editId, {
        message: form.message,
        review: form.review,
        user_name: form.user_name,
        user_address: form.user_address,
        user_image: imageUrl,
      });
      toast({ title: "Testimonial updated", description: "Changes have been saved." });
      setEditId(null);
      setForm(emptyForm);
      clearImageUpload();
      loadList();
    } catch (e) {
      toast({
        title: "Failed to update testimonial",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await testimonialApi.delete(deleteId);
      toast({ title: "Testimonial deleted" });
      setDeleteId(null);
      loadList();
    } catch (e) {
      toast({
        title: "Failed to delete testimonial",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Add testimonial form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Testimonial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_name">User name</Label>
                <Input
                  id="user_name"
                  value={form.user_name}
                  onChange={(e) => setForm((f) => ({ ...f, user_name: e.target.value }))}
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_address">User address</Label>
                <Input
                  id="user_address"
                  value={form.user_address}
                  onChange={(e) => setForm((f) => ({ ...f, user_address: e.target.value }))}
                  placeholder="New York, USA"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>User image (optional)</Label>
              <ToggleGroup
                type="single"
                value={imageMode}
                onValueChange={(v) => (v === "url" ? switchToUrl() : v === "upload" ? switchToUpload() : null)}
                className="justify-start"
              >
                <ToggleGroupItem value="url" aria-label="Paste URL" className="gap-1.5">
                  <Link className="w-4 h-4" />
                  Paste URL
                </ToggleGroupItem>
                <ToggleGroupItem value="upload" aria-label="Upload image" className="gap-1.5">
                  <Upload className="w-4 h-4" />
                  Upload image
                </ToggleGroupItem>
              </ToggleGroup>
              {imageMode === "url" ? (
                <div className="space-y-2">
                  <Input
                    type="url"
                    value={form.user_image}
                    onChange={(e) => setForm((f) => ({ ...f, user_image: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                  />
                  {form.user_image && (
                    <div className="flex items-center gap-2">
                      <img
                        src={form.user_image}
                        alt="Preview"
                        className="h-16 w-16 rounded-full object-cover border"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, user_image: "" }))}>
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {imagePreview ? (
                    <div className="flex items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full object-cover shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{imageFile?.name}</p>
                        <Button type="button" variant="outline" size="sm" onClick={clearImageUpload}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-center text-muted-foreground hover:text-foreground transition-colors py-4">
                      <Upload className="w-10 h-10" />
                      <span className="text-sm">Click to choose image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rating (1–5)</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, review: star }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= form.review
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Amazing quality and fast delivery..."
                rows={3}
                required
              />
            </div>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Testimonial
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Testimonials ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No testimonials yet.</p>
          ) : (
            <div className="space-y-3">
              {list.map((t) => (
                <div
                  key={t._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={t.user_image} alt={t.user_name} />
                      <AvatarFallback>{t.user_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{t.user_name}</span>
                        <span className="text-xs text-muted-foreground">{t.user_address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= t.review
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(t._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_user_name">User name</Label>
                <Input
                  id="edit_user_name"
                  value={form.user_name}
                  onChange={(e) => setForm((f) => ({ ...f, user_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_user_address">User address</Label>
                <Input
                  id="edit_user_address"
                  value={form.user_address}
                  onChange={(e) => setForm((f) => ({ ...f, user_address: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>User image (optional)</Label>
                <ToggleGroup
                  type="single"
                  value={imageMode}
                  onValueChange={(v) => (v === "url" ? switchToUrl() : v === "upload" ? switchToUpload() : null)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="url" aria-label="Paste URL" className="gap-1.5">
                    <Link className="w-4 h-4" />
                    Paste URL
                  </ToggleGroupItem>
                  <ToggleGroupItem value="upload" aria-label="Upload image" className="gap-1.5">
                    <Upload className="w-4 h-4" />
                    Upload image
                  </ToggleGroupItem>
                </ToggleGroup>
                {imageMode === "url" ? (
                  <div className="space-y-2">
                    <Input
                      type="url"
                      value={form.user_image}
                      onChange={(e) => setForm((f) => ({ ...f, user_image: e.target.value }))}
                      placeholder="https://example.com/photo.jpg"
                    />
                    {form.user_image && (
                      <div className="flex items-center gap-2">
                        <img src={form.user_image} alt="Preview" className="h-16 w-16 rounded-full object-cover border" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, user_image: "" }))}>
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    {imagePreview ? (
                      <div className="flex items-center gap-3">
                        <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full object-cover shrink-0" />
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{imageFile?.name}</p>
                          <Button type="button" variant="outline" size="sm" onClick={clearImageUpload}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 text-center text-muted-foreground hover:text-foreground transition-colors py-4">
                        <Upload className="w-10 h-10" />
                        <span className="text-sm">Click to choose image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Rating (1–5)</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, review: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= form.review
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_message">Message</Label>
                <Textarea
                  id="edit_message"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The testimonial will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await handleDelete();
              }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestimonialManager;
