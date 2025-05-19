using DAL_Celebrity_MSSQL;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ANC25_WEBAPI_DLL
{
    public  static  partial class CelebritiesAPIExtensions
    {
       
       public static RouteHandlerBuilder MapPhotoCelebrities(this IEndpointRouteBuilder routebuilder, string? prefix = "/Photos")
       {
         if (string.IsNullOrEmpty(prefix)) prefix =  routebuilder.ServiceProvider.GetRequiredService<IOptions<CelebritiesConfig>>().Value.PhotosRequestPath;
         return  routebuilder.MapGet($"{prefix}/{{fname}}", async (IOptions<CelebritiesConfig> iconfig, HttpContext context, string fname) => {
                CelebritiesConfig config = iconfig.Value;
                string filepath = Path.Combine(config.PhotosFolder, fname);
                if (!File.Exists(filepath)) throw new ANC25Exception("404001",$"MapGet({prefix}/{fname}):File Not Found",status:404);
                FileStream file = File.OpenRead(filepath);
                BinaryReader sr = new BinaryReader(file);
                BinaryWriter sw = new BinaryWriter(context.Response.BodyWriter.AsStream());
                int n = 0; byte[] buffer = new byte[2048];
                context.Response.ContentType = "image/jpeg";
                context.Response.StatusCode = StatusCodes.Status200OK;
                while ((n = await sr.BaseStream.ReadAsync(buffer, 0, 2048)) > 0) await sw.BaseStream.WriteAsync(buffer, 0, n);
                sr.Close(); sw.Close();
            }).WithName("GetPhoto");
        }


       public static RouteHandlerBuilder  MapCelebrities( this IEndpointRouteBuilder routebuilder, 
                                                         string prefix = "/api/Celebrities" )
       {
            var celebrities = routebuilder.MapGroup(prefix);
            //  все знаменитости
            celebrities.MapGet("/", (IRepository repo) => repo.GetAllCelebrities());
            //  знаменитость по ID
            celebrities.MapGet("/{id:int:min(1)}", (IRepository repo, int id) => {
                Celebrity? celebrity = repo.GetCelebrityById(id);
                if (celebrity == null) throw new ANC25Exception(status: 404, code: "404001", detail: $"Celebbrity Id = {id}");
                return Results.Ok(celebrity);
            }).WithName("GetCelebrityById");
            //  знаменитость  по ID события 
            celebrities.MapGet("/Lifeevents/{id:int:min(1)}", (IRepository repo, int id) => {
                Lifeevent? l = repo.GetLifeevetById(id);
                if (l == null) throw new ANC25Exception(status: 404, code: "404005", detail: $"Lifeevent Id = {id}");
                return Results.Ok(repo.GetCelebrityByLifeeventId(id));
            });
            //  удалить знаменитость  по ID
            celebrities.MapDelete("/{id:int:min(1)}", (IRepository repo, int id) => {
                Celebrity? celebrity = repo.GetCelebrityById(id);
                if (celebrity == null) throw new ANC25Exception(status: 404, code: "404002", detail: $"Celebbrity Id = {id}");
                if (!repo.DelCelebrity(id)) throw new ANC25Exception(status: 500, code: "500001", detail: $"Celebbrity Id = {id}");
                return Results.Ok(celebrity);
            });
            //  добавить новую знаменитость 
            celebrities.MapPost("/", (IRepository repo, Celebrity celebrity) => {
                if (!repo.AddCelebrity(celebrity)) throw new ANC25Exception(status: 500, code: "500002", detail: $"AddCelebrity");
                return Results.Ok(celebrity);
            });
            //  изменить знаменитость по ID  
            celebrities.MapPut("/{id:int:min(1)}", (IRepository repo, int id, Celebrity celebrity) => {
                Celebrity? c = repo.GetCelebrityById(id);
                if (c == null) throw new ANC25Exception(status: 404, code: "404003", detail: $"Celebbrity Id = {id}");
                if (!repo.UpdCelebrity(id, celebrity)) throw new ANC25Exception(status: 500, code: "500003", detail: $"UpdCelebrity");
                return Results.Ok(c);
            });
            //  получить файл фотографии по имени файла (fname)
            return 
            celebrities.MapGet("/photo/{fname}", async (IOptions<CelebritiesConfig> iconfig, HttpContext context, string fname) => {
                CelebritiesConfig config = iconfig.Value;
                string filepath = Path.Combine(config.PhotosFolder, fname);
                FileStream file = File.OpenRead(filepath);
                BinaryReader sr = new BinaryReader(file);
                BinaryWriter sw = new BinaryWriter(context.Response.BodyWriter.AsStream());
                int n = 0; byte[] buffer = new byte[2048];
                context.Response.ContentType = "image/jpeg";
                context.Response.StatusCode = StatusCodes.Status200OK;
                while ((n = await sr.BaseStream.ReadAsync(buffer, 0, 2048)) > 0) await sw.BaseStream.WriteAsync(buffer, 0, n);
                sr.Close(); sw.Close();
            });
            
       }


        public static RouteHandlerBuilder MapLifeevents(this IEndpointRouteBuilder routebuilder,
                                                        string prefix = "/api/Lifeevents")
        {
            var lifeevents = routebuilder.MapGroup(prefix);
            // все события 
            lifeevents.MapGet("/", (IRepository repo) => repo.GetAllLifeevents());
            //  событие по ID
            lifeevents.MapGet("/{id:int:min(1)}", (IRepository repo, int id) => {
                Lifeevent? lifeevent = repo.GetLifeevetById(id);
                if (lifeevent == null) throw new ANC25Exception(status: 404, code: "404004", detail: $"lifeevent Id = {id}");
                return Results.Ok(lifeevent);
            });
            //  все события по ID знаменитости  
            lifeevents.MapGet("/Celebrities/{id:int:min(1)}", (IRepository repo, int id) => {
                Celebrity? c = repo.GetCelebrityById(id);
                if (c == null) throw new ANC25Exception(status: 404, code: "404005", detail: $"Celebbrity Id = {id}");
                return repo.GetLifeeventsByCelebrityId(id);
            });
            //  удалить событие  по ID
            lifeevents.MapDelete("/{id:int:min(1)}", (IRepository repo, int id) => {
                Lifeevent? lifeevent = repo.GetLifeevetById(id);
                if (lifeevent == null) throw new ANC25Exception(status: 404, code: "404004", detail: $"Lifeevent Id = {id}");
                if (!repo.DelLifeevent(id)) throw new ANC25Exception(status: 500, code: "500004", detail: $"DeLifeevent");
                return Results.Ok(lifeevent);
            });
            //  добавить новое событие 
            lifeevents.MapPost("/", (IRepository repo, Lifeevent lifeevent) => {
                Celebrity? c = repo.GetCelebrityById(lifeevent.CelebrityId);
                if (c == null) throw new ANC25Exception(status: 404, code: "404005", detail: $"Celebrity Id = {lifeevent.CelebrityId}");
                if (!repo.AddLifeevent(lifeevent)) throw new ANC25Exception(status: 500, code: "500005", detail: $"AddLifeevent");
                return Results.Ok(lifeevent);
            });
            //  изменить событие по ID 
            return lifeevents.MapPut("/{id:int:min(1)}", (IRepository repo, int id, Lifeevent lifeevent) => {
                Lifeevent? l = repo.GetLifeevetById(id);
                if (l == null) throw new ANC25Exception(status: 404, code: "404006", detail: $"Lifeevent Id = {id}");
                if (lifeevent.CelebrityId <= 0 || repo.GetCelebrityById(lifeevent.CelebrityId) is null)
                    throw new ANC25Exception(status: 404, code: "404007", detail: $"Celebrity Id = {lifeevent.CelebrityId}");
                if (!repo.UpdLifeevent(id, lifeevent)) throw new ANC25Exception(status: 500, code: "500006", detail: $"UpdLifeevent");
                return Results.Ok(lifeevent);
            });
        }

    }
}




//builder.Services.AddScoped<IRepository, Repository>((IServiceProvider p) => {
//CelebritiesConfig config = p.GetRequiredService<IOptions<CelebritiesConfig>>().Value;
//return new Repository(config.ConnectionString);

//using System;
//using System.Text.Json;
//using Microsoft.Extensions.ApiDescriptions;
//using Microsoft.Extensions.DependencyInjection.Extensions;
//using Microsoft.Extensions.Options;
//using Swashbuckle.AspNetCore.Swagger;
//using Swashbuckle.AspNetCore.SwaggerGen;

//namespace Microsoft.Extensions.DependencyInjection
//{
//    public static class SwaggerGenServiceCollectionExtensions
//    {
//        public static IServiceCollection AddSwaggerGen(
//            this IServiceCollection services,
//            Action<SwaggerGenOptions> setupAction = null)
//        {
//            // Add Mvc convention to ensure ApiExplorer is enabled for all actions
//            services.Configure<AspNetCore.Mvc.MvcOptions>(c =>
//                c.Conventions.Add(new SwaggerApplicationConvention()));

//            // Register custom configurators that takes values from SwaggerGenOptions (i.e. high level config)
//            // and applies them to SwaggerGeneratorOptions and SchemaGeneratorOptions (i.e. lower-level config)
//            services.AddTransient<IConfigureOptions<SwaggerGeneratorOptions>, ConfigureSwaggerGeneratorOptions>();
//            services.AddTransient<IConfigureOptions<SchemaGeneratorOptions>, ConfigureSchemaGeneratorOptions>();

//            // Register generator and its dependencies
//            services.TryAddTransient<SwaggerGenerator>();
//            services.TryAddTransient<ISwaggerProvider>(s => s.GetRequiredService<SwaggerGenerator>());
//            services.TryAddTransient<IAsyncSwaggerProvider>(s => s.GetRequiredService<SwaggerGenerator>());
//            services.TryAddTransient(s => s.GetRequiredService<IOptions<SwaggerGeneratorOptions>>().Value);
//            services.TryAddTransient<ISchemaGenerator, SchemaGenerator>();
//            services.TryAddTransient(s => s.GetRequiredService<IOptions<SchemaGeneratorOptions>>().Value);
//            services.AddSingleton<JsonSerializerOptionsProvider>();
//            services.TryAddSingleton<ISerializerDataContractResolver>(s =>
//            {
//                var serializerOptions = s.GetRequiredService<JsonSerializerOptionsProvider>().Options;
//                return new JsonSerializerDataContractResolver(serializerOptions);
//            });

//            // Used by the <c>dotnet-getdocument</c> tool from the Microsoft.Extensions.ApiDescription.Server package.
//            services.TryAddSingleton<IDocumentProvider, DocumentProvider>();

//            if (setupAction != null) services.ConfigureSwaggerGen(setupAction);

//            return services;
//        }

//        public static void ConfigureSwaggerGen(
//            this IServiceCollection services,
//            Action<SwaggerGenOptions> setupAction)
//        {
//            services.Configure(setupAction);
//        }

//        private sealed class JsonSerializerOptionsProvider
//        {
//            private JsonSerializerOptions _options;
//#if !NETSTANDARD2_0
//            private readonly IServiceProvider _serviceProvider;

//            public JsonSerializerOptionsProvider(IServiceProvider serviceProvider)
//            {
//                _serviceProvider = serviceProvider;
//            }
//#endif

//            public JsonSerializerOptions Options => _options ??= ResolveOptions();

//            private JsonSerializerOptions ResolveOptions()
//            {
//                JsonSerializerOptions serializerOptions;

//                /*
//                 * First try to get the options configured for MVC,
//                 * then try to get the options configured for Minimal APIs if available,
//                 * then try the default JsonSerializerOptions if available,
//                 * otherwise create a new instance as a last resort as this is an expensive operation.
//                 */
//#if !NETSTANDARD2_0
//                serializerOptions =
//                    _serviceProvider.GetService<IOptions<AspNetCore.Mvc.JsonOptions>>()?.Value?.JsonSerializerOptions
//#if NET8_0_OR_GREATER
//                    ?? _serviceProvider.GetService<IOptions<AspNetCore.Http.Json.JsonOptions>>()?.Value?.SerializerOptions
//#endif
//#if NET7_0_OR_GREATER
//                    ?? JsonSerializerOptions.Default;
//#else
//                    ?? new JsonSerializerOptions();
//#endif
//#else
//                serializerOptions = new JsonSerializerOptions();
//#endif

//                return serializerOptions;
//            }
//        }
//    }
//}
