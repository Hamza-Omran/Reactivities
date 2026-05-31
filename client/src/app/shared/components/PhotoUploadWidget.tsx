import { CloudUpload } from "@mui/icons-material";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css"

import { useDropzone } from "react-dropzone";

type Props = {
  uploadPhoto: (file: Blob) => void;
  loading: boolean
}

export default function PhotoUploadWidget({uploadPhoto, loading}: Props) {

  const [files, setFiles] = useState<(File & { preview: string; })[]>([]);
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview))
    }
  }, [files])

  // now if we didn't upload the image and closed the component the image will still there so we need to dispose it so the page
  // size doesn't become big so we use the above useEffect
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file as Blob)
    })))
  }, []);

  const onCrop = useCallback(() => {
    // this will give us the cropper element from the ref that we are using
    const cropper = cropperRef.current?.cropper;
    cropper?.getCroppedCanvas().toBlob(blob => {
      uploadPhoto(blob as Blob)
    })
  }, [uploadPhoto])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Grid container spacing={3}>
      <Grid size={4}>
        <Typography variant="overline" color="secondary">
          Step 1 - Add Image
        </Typography>
        <Box {...getRootProps()}
            sx={{
                border: 'dashed 3px #eee',
                borderColor: isDragActive ? 'green' : '#eee',
                borderRadius: "5px",
                paddingTop: '30px',
                textAlign: 'center',
                height: '280px'
            }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{fontSize: 80}}/>
          <Typography variant="h5">Drop Image Here</Typography>
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </Box>
      </Grid>
      <Grid size={4}>
        <Typography variant="overline" color="secondary">
          Step 2 - Resize Image
        </Typography>
        {files[0]?.preview && 
        <Cropper 
            src={files[0]?.preview}
            style={{height: 300, width: "90%"}}
            initialAspectRatio={1}
            aspectRatio={1}
            preview=".img-preview"
            guides={false}
            viewMode={1}
            background={false}
            ref={cropperRef}
        />}
      </Grid>
      <Grid size={4}>
        {files[0]?.preview && (
            <>
                <Typography variant="overline" color="secondary">
                    Step 3 - Preview & Upload Image
                </Typography>
                <div className="img-preview" style={{width: 300,  height: 300, overflow: 'hidden'}} />
                <Button
                  sx={{my: 1, width: 300}}
                  onClick={onCrop}
                  variant="contained"
                  color="secondary"
                  loading={loading}
                >
                  Upload
                </Button>
            </>
        )}
      </Grid>
    </Grid>
  );
}
