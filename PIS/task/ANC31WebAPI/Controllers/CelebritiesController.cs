
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DAL = DAL_Celebrity_MSSQL;
using WEBAPI = ANC25_WEBAPI_DLL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using ANC25_WEBAPI_DLL;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace ANC31WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CelebritiesController :  ControllerBase
    {
        DAL.IRepository repo;
        LinkGenerator linker;
        SignInManager<IdentityUser> signinmanager;
        UserManager<IdentityUser>   usermanager;
        IPasswordHasher<IdentityUser> passwordhasher;
        RoleManager<IdentityRole> rolemanager;
        WEBAPI.IAuthenticate auth;

        public CelebritiesController(DAL.IRepository repo, LinkGenerator linker, IPasswordHasher<IdentityUser> passwordhasher,
                                        SignInManager<IdentityUser> signinmanager, UserManager<IdentityUser> usermanager, 
                                        RoleManager<IdentityRole> rolemanager)
        {
          this.repo = repo;
          this.linker = linker;
          this.usermanager = usermanager;
          this.signinmanager = signinmanager;
          this.passwordhasher = passwordhasher;   
          this.rolemanager = rolemanager; 
          this.auth = new WEBAPI.Authenticate(this.signinmanager, this.usermanager, passwordhasher, rolemanager); 
        }

        [HttpGet("Login")]
        public List<DAL.Celebrity> Login() { return this.repo.GetAllCelebrities(); }
        [HttpGet("401")]
        public IActionResult Get401() { return Unauthorized();  }
        //public IActionResult Get401() { return Unauthorized("Access Denied");  }
               
        [HttpGet("GetUserName")] public string GetUserName() {return this.HttpContext.User.Identity?.Name??"Empty"; }

        [HttpPost("Registration")] public  async Task<IActionResult> PostRegitration(UserManager<IdentityUser> um, IPasswordHasher<IdentityUser> ph,  string name, string pass)
        {
            IActionResult rc = Ok();
            if (! await um.CelebritiesRegistration(ph, name, pass))  rc = this.Problem(statusCode: 409, detail: $"CelebritiesRegistration({name},..)");
            return rc;
        }
        [HttpPost("SignIn")] public  async  Task<IActionResult> PostSignIn(SignInManager<IdentityUser> sm, string name, string pass)
        {
           return  await sm.CelebritiesSignOn(name, pass)?Ok():Unauthorized();  
        }
        [HttpPost("SignOut")]  public async Task<IActionResult> PostSignOut(SignInManager<IdentityUser> sm)
        {
              IActionResult rc = Ok();
              if (this.HttpContext.User?.Identity?.IsAuthenticated??false) 
                  if (!await sm.CelebritiesSignOut()) rc = NotFound("SignOut = false");
              return rc;
        }
        [Authorize(Roles = "Reader")]  
        [HttpGet("GetAllCelebrities")]  public List<DAL.Celebrity> Get() 
        {
           // string? name = this.HttpContext.User.Identity?.Name;
            return this.repo.GetAllCelebrities();
        }
        [Authorize(Roles = "Reader")] [HttpGet("GetCelebrityById/{id:int}")]  public DAL.Celebrity?  Get(int id ) 
        {  
            DAL.Celebrity? celebrity = this.repo.GetCelebrityById(id); ;
            if ( celebrity == null )  throw new  WEBAPI.ANC25Exception(code:"404001", detail:$"GetCelebrityById({id}) == null", status:404);   
            return celebrity;
        }
        [Authorize(Roles = "Reader")][HttpGet("GetPhoto/{photo}")] public IActionResult GetPhoto(string photo)
        {
            string prefix = this.HttpContext.RequestServices.GetRequiredService<IOptions<WEBAPI.CelebritiesConfig>>().Value.PhotosRequestPath;
            return   RedirectToRoute("GetPhoto", new {fname = photo});                
        }

        [Authorize(Roles = "Writer")]
        [HttpPost("AddCelebrity")]  public DAL.Celebrity? Post(DAL.Celebrity celebrity)
        {
             bool rc = false;   
             if (!(rc = this.repo.AddCelebrity(celebrity))) throw new WEBAPI.ANC25Exception(code: "400001", 
                                                           detail: $"AddCelebrity(celebrity) != true", status: 400);
            return celebrity;
        }
        [Authorize(Roles = "Editor,Writer")]
        [HttpPut("UpdCelebrity/{id:int:min(1)}")]  public DAL.Celebrity? Put(int id, DAL.Celebrity celebrity)
        {
           
            if (!this.repo.UpdCelebrity(id, celebrity)) throw new WEBAPI.ANC25Exception(code: "400002",
                                              detail: $"UpdCelebrity({id},celebrity) != true", status: 400);
            celebrity.Id = id;
            return celebrity;
        }
        [Authorize(Roles = "Cleaner")]
        [HttpDelete("DelCelebrity/{id:int:min(1)}")]public  void Delete(int id)
        {
            bool rc = false;
            if (!(rc = this.repo.DelCelebrity(id))) throw new WEBAPI.ANC25Exception(code: "40000",
                                              detail: $"DelCelebrity({id}) != true", status: 400);
            //return rc;
        }                    
    }
}


// rc = Unauthorized();
///    await  sm.SignInAsync(user, false);  

//this.HttpContext   .S  SingIn(name, pass)) rc = this.Unauthorized();
//await sm.CheckPasswordSignInAsync(user, pass, true);
// HttpContext c = this.HttpContext; 

// await  this.HttpContext.CelebritiesSignOn(name, pass);           //if ( !await this.HttpContext.CelebritiesSignOn(name, pass))
//IActionResult rc = Ok();/// sm.SignInAsync(user, new AuthenticationProperties(), "Cookies");

// IdentityUser? user  = await usermanager.FindByNameAsync(name); //.Result ?? new IdentityUser { UserName = null };
//var claims = new List<Claim>
//            {
//                new Claim(ClaimTypes.Name, name),
//                new Claim(ClaimTypes.Email, "user@example.com"),
//                new Claim(ClaimTypes.Role, "Guest")
//            };

//    var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
//    await HttpContext.SignInAsync(
//                          CookieAuthenticationDefaults.AuthenticationScheme,
//                          new ClaimsPrincipal(claimsIdentity),
//                          new AuthenticationProperties
//                          {
//                                IsPersistent = true, // "Запомнить меня"
//                                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
//                          });

//return Ok();