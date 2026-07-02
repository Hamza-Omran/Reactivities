using System;
using System.Net;
using System.Net.Http.Json;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Email;

// we get this interface from asp net identity
//  we use Brevo's REST API directly because Brevo no longer provides a current official C# email SDK
public class EmailSender(IHttpClientFactory httpClientFactory, IConfiguration config) : IEmailSender<User>
{
    //  for the confirmation link it will be created in the signup and for the default message we will override it here
    public async Task SendConfirmationLinkAsync(User user, string email, string confirmationLink)
    {

        var subject = "Confirm Your Email Address";
        //  to write html
        var body = $@"
            <p>Hi {user.DisplayName}</p>
            <p>Please confirm your email by clicking the link below</p>
            <p><a href='{confirmationLink}'>Click here to verify email</a></p>
            <p>Thanks</p>
        ";

        await SendEmailAsync(email, subject, body);
    }


    // the user we won't pass it in the account controller as it is part of the asp identity
    public async Task SendPasswordResetCodeAsync(User user, string email, string resetCode)
    {
        var subject = "Reset Your Password";
        var encodedEmail = WebUtility.UrlEncode(email);
        var encodedCode = WebUtility.UrlEncode(resetCode);

        //  to write html
        var body = $@"
            <p>Hi {user.DisplayName}</p>
            <p>Please click this link to reset your password</p>
            <p><a href='{config["ClientAppUrl"]}/reset-password?email={encodedEmail}&code={encodedCode}'>
                Click to reset your password
            </a></p>
            <p>If you didn't request this, you can ignore this email</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    // this will need us to make a customized one since we can't change the link to our client app so we will use the above function reset code async
    public Task SendPasswordResetLinkAsync(User user, string email, string resetLink)
    {
        throw new NotImplementedException();
    }

    private async Task SendEmailAsync(string email, string subject, string body)
    {
        var senderEmail = config["Brevo:SenderEmail"] 
            ?? throw new InvalidOperationException("Brevo sender email is not configured");
        var senderName = config["Brevo:SenderName"] ?? "Renty";
        var brevo = httpClientFactory.CreateClient("Brevo");

        var message = new
        {
            sender = new
            {
                name = senderName,
                email = senderEmail
            },
            to = new[]
            {
                new
                {
                    email
                }
            },
            subject,
            htmlContent = body
        };

        // keep the link visible in the API console while testing email confirmation locally
        Console.WriteLine(body);

        var response = await brevo.PostAsJsonAsync("smtp/email", message);
        if (response.IsSuccessStatusCode) return;

        var error = await response.Content.ReadAsStringAsync();
        throw new InvalidOperationException($"Brevo email send failed: {(int)response.StatusCode} {response.ReasonPhrase}. {error}");
    }
}
