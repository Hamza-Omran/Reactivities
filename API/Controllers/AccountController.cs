using System;
using System.Net.Http.Headers;
using System.Text;
using API.DTOs;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using static API.DTOs.GitHubInfo;

namespace API.Controllers;

// now we gonna need the userManager too, however the signInManager gives us access to it so we will import one rather than importing two
public class AccountController(SignInManager<User> signInManager, IEmailSender<User> emailSender, IConfiguration config) : BaseApiController
{

    [AllowAnonymous]
    [HttpPost("github-login")]
    public async Task<ActionResult> LoginWithGithub(string code)
    {
        if(string.IsNullOrEmpty(code)) return BadRequest("Missing authorization code");

        // as we are going to create a new instance of the http client we will use using keyword
        using var httpClient = new HttpClient();
        // this is to get the response from github in json rather than xml format
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        // step 1 - exchange code for access token
        var tokenResponse = await httpClient.PostAsJsonAsync(
            "https://github.com/login/oauth/access_token",
            new GitHubAuthRequest
            {
                Code=code,
                ClientId=config["Authentication:GitHub:ClientId"]!,
                ClientSecret=config["Authentication:GitHub:ClientSecret"]!,
                RedicrectUri=$"{config["ClientAppUrl"]}/auth-callback"
            }
        );

        if(!tokenResponse.IsSuccessStatusCode)
            return BadRequest("Failed to get access token");

        var tokenContent = await tokenResponse.Content.ReadFromJsonAsync<GitHubTokenResponse>();

        if(string.IsNullOrEmpty(tokenContent?.AccessToken))
            return BadRequest("Failed to retrieve access token");
        
        // step 2 - fetch user info from github
        httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", tokenContent.AccessToken);
        httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Reactivities"); // it doesn't need to match the app specifically and we made it this way rather than reactivitiesdev

        var userResponse = await httpClient.GetAsync("https://api.github.com/user");

        if(!userResponse.IsSuccessStatusCode)
            return BadRequest("Failed to fetch user info from GitHub");
        
        var user = await userResponse.Content.ReadFromJsonAsync<GitHubUser>();

        if(user == null) return BadRequest("Failed to read user from Github");

        // step 3 - getting the email if needed => since if the user has a public email address then we won't need this query
        if (string.IsNullOrEmpty(user?.Email))
        {
            var emailResponse = await httpClient.GetAsync("https://api.github.com/user/emails");

            if (emailResponse.IsSuccessStatusCode)
            {
                var emails = await emailResponse.Content.ReadFromJsonAsync<List<GitHubEmail>>();

                // this called the pattern check
                var primary = emails?.FirstOrDefault(e => e is {Primary: true, Verified: true})?.Email;

                if (string.IsNullOrEmpty(primary))
                {
                    return BadRequest("Failed to get email from GitHub");
                }

                user!.Email = primary;
            }
        }

        // step 4 - find for create user and sign in
        var existingUser = await signInManager.UserManager.FindByEmailAsync(user!.Email);

        if(existingUser == null)
        {
            existingUser = new User
            {
                Email = user.Email,
                UserName = user.Email,
                DisplayName = user.Name,
                ImageUrl = user.ImageUrl
            };

            var createdResult = await signInManager.UserManager.CreateAsync(existingUser); // now there is a version of create async that doesn't ask for a password

            if(!createdResult.Succeeded)
                return BadRequest("Failed to create user");
        }

        await signInManager.SignInAsync(existingUser, false); //  the false is for the is persistent

        return Ok(); // this is for testing only
    }

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

    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordDto passwordDto)
    {
        // we can use the User as it is a claims principle as we are in the account controller, as long as they sign in
        var user = await signInManager.UserManager.GetUserAsync(User); 

        if(user == null) return Unauthorized();

        var result = await signInManager.UserManager.ChangePasswordAsync(user, passwordDto.CurrentPassword, passwordDto.NewPassword);

        if(result.Succeeded) return Ok();

        // as if they entered a weak password they will get a validation error and so on till they are good
        return BadRequest(result.Errors.First().Description); // we will depend on the toast in the react app
    }
}
