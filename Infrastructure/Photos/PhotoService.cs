using System;
using Application.Interfaces;
using Application.Profiles.DTOs;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using CloudinaryDotNet;
using Microsoft.Extensions.Options;

namespace Infrastructure.Photos;

public class PhotoService : IPhotoService
{
    private readonly Cloudinary _cloudinary;

    //  we are going to create a service for initializing cloudinary
    public PhotoService(IOptions<CloudinarySettings> config)
    {
        var account = new Account(
            config.Value.CloudName,
            config.Value.ApiKey,
            config.Value.ApiSecret
        );

        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> DeletePhoto(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);

        var result = await _cloudinary.DestroyAsync(deleteParams);

        if(result.Error != null)
        {
            throw new Exception(result.Error.Message);
        }

        return result.Result;
    }

    // the ? is to be able to return null and also in the interface
    public async Task<PhotoUploadResult?> UploadPhoto(IFormFile file)
    {
        if(file.Length > 0)
        {
            // we are using the using keyword so when we finish we dispose the file stream from the memory
            await using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                // Transformation = new Transformation().Height(500).Width(500).Crop("fill")
                Folder = "Reactivities 2026"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if(uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return new PhotoUploadResult
            {
                PublicId = uploadResult.PublicId,
                Url = uploadResult.SecureUrl.AbsoluteUri
            };
        }

        return null;
    }
}
