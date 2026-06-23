using System;
using System.Text;
using API.DTOs;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

// now we gonna need the userManager too, however the signInManager gives us access to it so we will import one rather than importing two
public class AccountController(SignInManager<User> signInManager, IEmailSender<User> emailSender, IConfiguration config) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
    {
        var user = new User
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Email
        };
        
        var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);
        
        if(result.Succeeded)
        {
               await SendConfirmationLinkAsync(user, registerDto.Email);

               return Ok();
        }

        foreach( var error in result.Errors)
        {
            ModelState.AddModelError(error.Code, error.Description);
        }
        // this will give us our validation errors and the identity errors as well
        return ValidationProblem();
    }

    [AllowAnonymous]
    [HttpGet("resendConfirmationEmail")]
    public async Task<ActionResult> ResendConfirmEmail(string? email, string? userId)
    {
        if(string.IsNullOrEmpty(email) && string.IsNullOrEmpty(userId))
        {
            return BadRequest("Email or UserId must be provided");
        }
        var user = await signInManager.UserManager.Users.FirstOrDefaultAsync(x => x.Email == email || x.Id == userId);

        if(user == null || string.IsNullOrEmpty(user.Email)) return BadRequest("User not found");

        await SendConfirmationLinkAsync(user, user.Email);

        return Ok();
    }

    private async Task SendConfirmationLinkAsync(User user, string email)
    {
        var code = await signInManager.UserManager.GenerateEmailConfirmationTokenAsync(user); // however the code might contain special characters
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

        var confirmedEmailUrl = $"{config["ClientAppUrl"]}/confirm-email?userId={user.Id}&code={code}";

        await emailSender.SendConfirmationLinkAsync(user, email, confirmedEmailUrl);
    }

    //     The [AllowAnonymous] allows it because you need to check authentication from the client-side when the app 
    // loads/refreshes.

    // Here's why:

    // JavaScript can't read cookies → When React loads, it doesn't know if you're logged in
    // Need a public endpoint → So React can ask: "Am I logged in?"
    // It's safe anyway → The endpoint has built-in protection:

    // if(User.Identity?.IsAuthenticated == false) return NoContent();  // No data sent if not logged in
    // What happens:

    // Unauthenticated user calls it → Returns 204 NoContent (empty response)
    // Authenticated user calls it → Returns user info (DisplayName, Email, etc.)
    // So even though it's public, only authenticated users get actual data. It's a safe pattern used in most web apps
    //  But the browser AUTOMATICALLY SENDS it with API requests and that is out the httpOnly means so no js can ever access it even if malicious

    [AllowAnonymous] // the reason for doing this is that we are going to call it from our client when the user first come to our
    //  application or refreshes the page. because at that point if they are logged in then all what we have is access to the 
    // cookie, and we can't access that cookie from our javascript code and this info should be sent to any one as we can't 
    // check if this user is authenticated or not else it gonna get 401 unauthorized
    [HttpGet("user-info")]
    public async Task<ActionResult> GetUserInfo()
    {
        // it check the memory
        if(User.Identity?.IsAuthenticated == false) return NoContent();

        var user = await signInManager.UserManager.GetUserAsync(User);

        if(user == null) return Unauthorized();

        return Ok(new
        {
            user.DisplayName,
            user.Email,
            user.Id,
            user.ImageUrl
        });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return NoContent();
    }

}
