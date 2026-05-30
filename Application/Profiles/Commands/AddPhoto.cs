using System;
using Application.Core;
using Application.Interfaces;
using Domain;
using Infrastructure.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using Persistence;

namespace Application.Profiles.Commands;

public class AddPhoto
{
    // we are going to return the photo when we upload it as the client got no way of knowing what the url is
    public class Command : IRequest<Result<Photo>>
    {
        public required IFormFile File { get; set; }
    }

    public class Handler(IUserAccessor userAccessor, AppDbContext context, IPhotoService photoService) : IRequestHandler<Command, Result<Photo>>
    {
        public async Task<Result<Photo>> Handle(Command request, CancellationToken cancellationToken)
        {
            var uploadResult = await photoService.UploadPhoto(request.File);

            if(uploadResult  == null) return Result<Photo>.Failure("Failed to upload the photo", 400);

            var user = await userAccessor.GetUserAsync();

            var photo = new Photo
            {
                Url = uploadResult.Url,
                PublicId = uploadResult.PublicId,
                UserId = user.Id
            };

            // we check if the imageurl is null if so then we execute what is on the right of the =
            user.ImageUrl ??= photo.Url;

            context.Photos.Add(photo);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            return result
                ? Result<Photo>.Success(photo)
                : Result<Photo>.Failure("Problem saving photo to DB", 400);
        }
    }
}
