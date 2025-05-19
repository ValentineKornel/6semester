using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using WEBAPI = ANC25_WEBAPI_DLL;
using DAL_Celebrity_MSSQL;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.DataProtection;

namespace ANC25_WEBAPI_DLL
{
    public static partial class CelebritiesAPIExtensions
    {
                  
        public static IServiceCollection AddCelebritiesAuthServices(this WebApplicationBuilder builder)
        {
            ServiceProvider sp = builder.Services.BuildServiceProvider();
            CelebritiesConfig? config = sp.GetService<IOptions<WEBAPI.CelebritiesConfig>>()?.Value;
            if (config == null) throw new ArgumentNullException("CelebritiesConfig not created");
            builder.Services.AddDbContext<AuthDbContext>(o => o.UseSqlServer(config.ConnectionString));

         //   AuthenticationBuilder ab = builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)   //  обязятельно до builder.Services.AddDefaultIdentity<IdentityUser>
         //.AddCookie(o =>
         //{
         //    o.LoginPath = new PathString("/Celebrities/Login");
         //    o.AccessDeniedPath = new PathString("/Celebrities/401");
         //    o.ExpireTimeSpan = TimeSpan.FromHours(2); // Время жизни куки
         //    o.SlidingExpiration = true; // Обновление времени жизни при активности
         //    // Дополнительные настройки безопасности
         //    o.Cookie.HttpOnly = true;
         //    o.Cookie.SameSite = SameSiteMode.Strict;
         //    // o.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Только HTTPS
         //    // Обработка событий (опционально)
         //    o.Events = new CookieAuthenticationEvents
         //    {
         //        OnRedirectToLogin = ctx =>
         //        {
         //            // Для API-запросов возвращаем 401 вместо редиректа
         //            if (ctx.Request.Path.StartsWithSegments("/api"))
         //            {
         //                ctx.Response.StatusCode = 401;
         //                return Task.CompletedTask;
         //            }
         //            ctx.Response.Redirect(ctx.RedirectUri);
         //            return Task.CompletedTask;
         //        }
         //    };
         //});

            builder.Services.AddDataProtection()
              .PersistKeysToFileSystem(new DirectoryInfo(@"C:\temp-keys\"))
              .SetApplicationName("Celebrities");


            builder.Services.AddDefaultIdentity<IdentityUser> ( o =>
               {   
                   o.SignIn.RequireConfirmedAccount = false;
                   o.SignIn.RequireConfirmedPhoneNumber = false;
                   o.SignIn.RequireConfirmedEmail = false;
                   o.Password.RequiredUniqueChars = 1;
                   o.Password.RequireNonAlphanumeric = false;
                   o.Password.RequireDigit = false;
                   o.Password.RequireLowercase = false;
                   o.Password.RequireUppercase = false;
                   o.User.RequireUniqueEmail = false;
               
               }
              )
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AuthDbContext>();


            builder.Services.ConfigureApplicationCookie(options =>
            {
                options.LoginPath = new PathString("/api/Celebrities/Login"); // если user - EMPTY то перекинет на
                                                                              // Login и вернет 401 из обработчика события ниже
                options.AccessDeniedPath = new PathString("/api/Celebrities/401"); // если у роли нет привилегий ты переранаправит на 401
                options.ExpireTimeSpan = TimeSpan.FromHours(2);
                options.SlidingExpiration = true;
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Strict;
                options.Events = new CookieAuthenticationEvents
                {
                    OnRedirectToLogin = ctx =>
                    {
                        if (ctx.Request.Path.StartsWithSegments("/api"))
                        {
                            ctx.Response.StatusCode = 401;
                            ctx.Response.Redirect(options.AccessDeniedPath);
                            return Task.CompletedTask;
                        }
                        ctx.Response.Redirect(ctx.RedirectUri);
                        return Task.CompletedTask;
                    },

                };
            });

            return builder.Services;
        }

        public static async Task<bool> SignOnCelebrities(this SignInManager<IdentityUser>  sm, string username, string password)
        {
              SignInResult  result =  await sm.PasswordSignInAsync(username, password, isPersistent: false, lockoutOnFailure: false);
              return result.Succeeded;   
        }
     
        public static async Task<bool> CelebritiesSignOn(this SignInManager<IdentityUser> sm, string username, string password)
        {
            
            SignInResult result = await sm.PasswordSignInAsync(username, password, isPersistent: false, lockoutOnFailure: false);
            return result.Succeeded;
        }
        
        public static async Task<bool> CelebritiesSignOut(this SignInManager<IdentityUser> sm)
        {
            await sm.SignOutAsync();
            return true;
        }
        
        public static async Task<bool> CelebritiesRegistration(this UserManager<IdentityUser> um, IPasswordHasher<IdentityUser> ph, string name, string password)
        {
            bool rc = false;
            IdentityUser newuser = new IdentityUser { UserName = name, Id = name };
            if (um.FindByNameAsync(name).Result == null)
            {
                 newuser.PasswordHash = ph.HashPassword(newuser, password); ;
                 IdentityResult result = await  um.CreateAsync(newuser);
                 rc = result.Succeeded;
             }
            return rc;
        }
        
        
        
        
        // public bool Registration(string name, string password)
        //{
        //    bool rc = false;
        //    IdentityUser newuser = new IdentityUser { UserName = name, Id = name };
        //    if (this.usermanager.FindByNameAsync(name).Result == null)
        //    {
        //        newuser.PasswordHash = this.passwordhasher.HashPassword(newuser, password); ;
        //        IdentityResult result = this.usermanager.CreateAsync(newuser).Result;
        //        rc = result.Succeeded;
        //    }
        //    return rc;
        //}



        //public static async Task<bool> CelebritiesSignOn(this HttpContext context, string username, string password)
        //{
        //    bool rc = true;
        //         var claims = new List<Claim>{new Claim(ClaimTypes.Name, username), new Claim(ClaimTypes.Role, "Guest")};
        //         var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        //         await context.SignInAsync(
        //                                    CookieAuthenticationDefaults.AuthenticationScheme,
        //                                    new ClaimsPrincipal(claimsIdentity),
        //                                    new AuthenticationProperties {IsPersistent = true, ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
        //                                 });
        //         return rc;          

        //}
    }

    public interface IAuthenticate
    {
        Task<bool> SingInAsync          (string name, string password);
        bool       SingIn               (string name, string password);
        bool       Registration         (string name, string password);
        bool       RegistrationAndSignIn(string name, string password);
        bool       UserToRole           (string username, string rolename); 
    }
    public class Authenticate : IAuthenticate
    {
        SignInManager<IdentityUser>   signinmanager;
        UserManager<IdentityUser>     usermanager;
        IPasswordHasher<IdentityUser> passwordhasher;
        RoleManager<IdentityRole>     rolemanager;
        public Authenticate(SignInManager<IdentityUser> signinmanager, UserManager<IdentityUser> usermanager,
                           IPasswordHasher<IdentityUser> passwordhasher, RoleManager<IdentityRole> rolemanager)
        {
            this.signinmanager = signinmanager;
            this.usermanager = usermanager;
            this.passwordhasher = passwordhasher;
            this.rolemanager = rolemanager; 
        }

        public async Task<bool> SingInAsync(string name, string password)
        {
          
            bool rc = true;
            IdentityUser user;
            try
            {
                user = await usermanager.FindByNameAsync(name) ?? new IdentityUser { UserName = null };
                if (rc = await this.usermanager.CheckPasswordAsync(user, password))
                {
                    await this.signinmanager.SignInAsync(user, isPersistent: false);
                }
            }
            catch (Exception e) { rc = false;}
            return rc;
        }
        public bool SingIn(string name, string password)
        {
            bool rc = true;
            try
            {
                IdentityUser  user = usermanager.FindByNameAsync(name).Result ?? new IdentityUser { UserName = null };            
                if (rc = (user.UserName != null && this.usermanager.CheckPasswordAsync(user, password).Result))
                {
                         rc =   this.signinmanager.PasswordSignInAsync(user,password, isPersistent: false, lockoutOnFailure:false).Result.Succeeded;   
                      //  this.signinmanager.SignInAsync(user, isPersistent: false).Wait();                      
                }
            }
            catch (Exception e) { rc = false; }
            return rc;
        }
        public bool Registration(string name, string password)
        {
            bool rc = false; 
            IdentityUser newuser = new IdentityUser {UserName = name, Id = name};
            if (this.usermanager.FindByNameAsync(name).Result == null)
            {
                newuser.PasswordHash = this.passwordhasher.HashPassword(newuser, password); ;
                IdentityResult result = this.usermanager.CreateAsync(newuser).Result;
                rc =  result.Succeeded;
            }   
            return rc;
        }
        public bool RegistrationAndSignIn(string name, string password)
        {
            return (this.Registration(name, password)&&this.UserToRole(name, "Guest"))
                   ? this.SingIn(name, password)
                   : false;
             
        }
        public bool UserToRole(string username, string rolename)
        {
            bool rc = false;
            IdentityUser user =  this.usermanager.FindByNameAsync(username).Result??new IdentityUser{UserName = null};
            if (rc = (user.UserName != null)&&(this.rolemanager.RoleExistsAsync(rolename).Result)) 
            {
               rc =  this.usermanager.AddToRoleAsync(user, rolename).Result.Succeeded;
            }
            return rc;
        }
    }
}




//      .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
//{
//    options.AccessDeniedPath = @"http://XXXX.com";
//    options.LoginPath = @"http://XXXX.com"; // Полное отключение
//    options.Events.OnRedirectToLogin = ctx =>
//    {
//        ctx.Response.StatusCode = 401;
//        return Task.CompletedTask;
//    };
//});





//.AddCookie(options => {
//           options.LoginPath = @"/Login"; // Полное отключение
//           //options.Events.OnRedirectToLogin = ctx =>
//           //{
//           //    ctx.Response.StatusCode = 401;
//           //    return Task.CompletedTask;
//           //};
//  });



//options.LoginPath = PathString.Empty;
// options.AccessDeniedPath = PathString.Empty;
// options.Events = new CookieAuthenticationEvents
// {
//     OnRedirectToLogin = context => Task.CompletedTask,
//     OnRedirectToAccessDenied = context => Task.CompletedTask
// };
//    options.Cookie.Name = "Celebrities";
//    options.LoginPath = "/api/Celebrities/401";     // Путь для перенаправления
//    options.AccessDeniedPath = "/api/Celebrities/401";
//    //options.Events.OnRedirectToLogin = context =>{
//    //                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
//    //                    return Task.CompletedTask;
//    //};
//    //options.Events.OnRedirectToAccessDenied = context => {
//    //           context.Response.StatusCode = StatusCodes.Status401Unauthorized;
//    //           return Task.CompletedTask;
//    //};
// });


//{
//    options.Cookie.Name = "Celebrities";
//    options.LoginPath = "/api/Celebrities/401";     // Путь для перенаправления
//    options.AccessDeniedPath = "/api/Celebrities/401";
//    //options.ExpireTimeSpan = TimeSpan.FromDays(7);
//    //options.SlidingExpiration = true;
//    //context.Response.StatusCode = StatusCodes.Status401Unauthorized;
//    //return Task.CompletedTask;

//builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
//{
//    options.Cookie.Name = "Celebrities";
//    options.LoginPath = "/api/Celebrities/401";     // Путь для перенаправления
//    options.AccessDeniedPath = "/api/Celebrities/401";
//    //options.ExpireTimeSpan = TimeSpan.FromDays(7);
//    //options.SlidingExpiration = true;
//    //context.Response.StatusCode = StatusCodes.Status401Unauthorized;
//    //return Task.CompletedTask;
//});
//builder.Services.AddDataProtection()
//       .PersistKeysToFileSystem(new DirectoryInfo(@"C:\temp-keys\"))
//       .SetApplicationName("Celebrities");



//user, password, isPersistent: false, lockoutOnFailure: false);



//  if (rc = this.signinmanager.CanSignInAsync(user).Result)


//public async Task<bool> UserRegistration(UserManager<IdentityUser> um, IPasswordHasher<IdentityUser> ph, string name, string pass)
//{
//    IdentityUser newuser = new IdentityUser { UserName = name };
//    string pashash = ph.HashPassword(newuser, pass);
//    newuser.PasswordHash = pashash;
//    IdentityResult result = await um.CreateAsync(newuser);
//    return result.Succeeded;
//}
//public async Task<bool> UserToRole(UserManager<IdentityUser> um, string username, string rolename)
//{
//    bool rc = false;
//    IdentityUser? user = await um.FindByNameAsync(username);
//    if (user != null && (await um.GetRolesAsync(user)).FirstOrDefault(s => s.Equals(rolename)) == null)
//        rc = (await um.AddToRoleAsync(user, rolename)).Succeeded;
//    return rc;
//}






//builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
//.AddCookie(options =>
//{
//    options.Events.OnRedirectToLogin = context =>
//    {
//        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
//        return Task.CompletedTask;
//    };
//});





//    bool rc = true;
//    IdentityUser user;
//            try
//            {
//                user =  usermanager.FindByNameAsync(name).Result??new IdentityUser{UserName = null};   //   .Wait();               
//if (rc = (user.UserName != null && this.usermanager.CheckPasswordAsync(user, pass).Result))
//{
//    this.signinmanager.SignInAsync(user, isPersistent: false).Wait();
//}
//            }
//            catch (Exception e){ rc = false; }


// builder.Services.AddDataProtection()
//.PersistKeysToFileSystem(new DirectoryInfo(@"C:\temp-keys\"));

//  {

//    //     options.Events.OnRedirectToAccessDenied = context =>
//    //     {
//    //             context.Response.StatusCode = StatusCodes.Status401Unauthorized;
//    //             return Task.CompletedTask;
//    //     };
// });


////builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme);
//builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
//.AddOpenIdConnect(o => { 
//    o.AccessDeniedPath = "/api/Celebrities/401";
//});




//.AddJwtBearer(o => {
//    o.Events.OnAuthenticationFailed = context => { 
//        context.Response.StatusCode  = StatusCodes.Status401Unauthorized;
//        return Task.CompletedTask;
//     };
//    //.LoginPath = "/api/Celebrities/401";
//    //o.AccessDeniedPath = "/api/Celebrities/401"
//});




//namespace Auth_Celebrities
//{
