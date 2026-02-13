"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface LogoUploadProps {
    currentLogo: string;
    clientId: string;
    onUpload: (url: string) => void;
}

export function LogoUpload({ currentLogo, clientId, onUpload }: LogoUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentLogo || null);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validation
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size must be less than 2MB");
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
            toast.error("Only JPG, PNG, and SVG are allowed");
            return;
        }

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setUploading(true);

        // Upload
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/clients/${clientId}/settings/logo`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                onUpload(data.url);
                toast.success("Logo uploaded successfully");
            } else {
                toast.error("Upload failed");
                setPreview(currentLogo); // Revert
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Upload failed");
            setPreview(currentLogo);
        } finally {
            setUploading(false);
        }

    }, [clientId, currentLogo, onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/svg+xml': []
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group">
                {preview ? (
                    <>
                        <img src={preview} alt="Logo" className="h-full w-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={(e) => { e.stopPropagation(); setPreview(null); onUpload(""); }}
                                className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 mb-1" />
                        <span className="text-xs">No Logo</span>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                    </div>
                )}
            </div>

            <div {...getRootProps()} className={`flex-1 cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center text-sm text-gray-500">
                    <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                    <p className="text-xs">SVG, PNG, JPG (max. 2MB)</p>
                </div>
            </div>
        </div>
    );
}
