using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

// this controller so when the client is asking for a route that doesn't exist the backend sends to it a meaningful message
// controller have the view support and a view in terms of mvc is an html template
[AllowAnonymous] // since if we have refreshed the homepage and we don't have a cookie then it will show page is not working
public class FallBackController : Controller
{
    public IActionResult Index()
    {
        return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html"), "text/HTML");
    }
}
