using System;
using Domain;

namespace Infrastructure.Interfaces;

public interface IUserAccessor
{
    string GetUserId();

    Task<User> GetUserAsync();
    Task<User> GetUserWithPhotosAsync();
}
