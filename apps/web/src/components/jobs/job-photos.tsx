"use client";

import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@fieldpro/ui/components/card";
import { Camera, Loader2, Trash2, Image as ImageIcon } from "lucide-react";

export function JobPhotos({
  jobId,
  jobStatus,
}: {
  jobId: string;
  jobStatus: string;
}) {
  const isEditable = jobStatus !== "CANCELLED";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.job.getPhotos.useQuery({ jobId });

  const addPhotoMutation = trpc.job.addPhoto.useMutation({
    onSuccess: () => {
      utils.job.getPhotos.invalidate({ jobId });
    },
  });

  const deletePhotoMutation = trpc.job.deletePhoto.useMutation({
    onSuccess: () => {
      utils.job.getPhotos.invalidate({ jobId });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    const maxLabel = isVideo ? "50MB" : "5MB";

    if (file.size > maxSize) {
      alert(`El archivo es demasiado grande. El máximo permitido es ${maxLabel}.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();

      if (isVideo) {
        reader.onload = async () => {
          await addPhotoMutation.mutateAsync({
            jobId,
            url: reader.result as string,
            type: "OTHER",
          });
        };
        reader.readAsDataURL(file);
      } else {
        const compressImage = (
          base64Str: string,
          maxWidth: number = 1024
        ): Promise<string> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = maxWidth;
              const MAX_HEIGHT = 1024;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext(
                "2d"
              ) as CanvasRenderingContext2D | null;
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
              }
              resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
          });
        };

        reader.onload = async () => {
          const compressedBase64 = await compressImage(reader.result as string);
          await addPhotoMutation.mutateAsync({
            jobId,
            url: compressedBase64,
            type: "OTHER",
          });
        };

        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar el archivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="card-fieldpro">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Fotos y Videos del Proyecto
          </CardTitle>
          <CardDescription>
            Sube fotos o videos del progreso, antes y después del trabajo.
          </CardDescription>
        </div>

        {isEditable && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || addPhotoMutation.isPending}
            >
              {isUploading || addPhotoMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              {isUploading ? "Subiendo..." : "Subir Foto/Video"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : photos?.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay fotos para este proyecto aún.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {photos?.map((photo: { id: string; url: string }) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
              >
                {photo.url.startsWith("data:video/") || photo.url.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i) ? (
                  <video
                    src={photo.url}
                    className="h-full w-full object-cover bg-black"
                    controls
                    preload="metadata"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photo.url}
                    alt="Foto del proyecto"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-white"
                  />
                )}

                {isEditable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        deletePhotoMutation.mutate({ id: photo.id })
                      }
                      disabled={deletePhotoMutation.isPending}
                    >
                      {deletePhotoMutation.isPending &&
                      deletePhotoMutation.variables?.id === photo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
