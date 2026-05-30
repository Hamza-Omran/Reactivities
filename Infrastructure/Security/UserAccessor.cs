using System;
using System.Security.Claims;
using Domain;
using Infrastructure.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security;

public class UserAccessor(IHttpContextAccessor httpContextAccessor, AppDbContext dbcontext) : IUserAccessor
{
    public async Task<User> GetUserAsync()
    {
        return await dbcontext.Users.FindAsync(GetUserId())
            ?? throw new UnauthorizedAccessException("No user is logged in");
    }

    public string GetUserId()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new Exception("No User Found");
    }

    public async Task<User> GetUserWithPhotosAsync()
    {
        var userId = GetUserId();

        //  we can't use the include method with findasync since it can't be used with eager loading
        return await dbcontext.Users
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(x => x.Id == userId)
                ?? throw new UnauthorizedAccessException("No user is logged in");    
    }
}
