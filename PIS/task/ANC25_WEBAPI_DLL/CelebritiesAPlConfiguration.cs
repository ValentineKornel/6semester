using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
namespace ANC25_WEBAPI_DLL
{
    public static partial class CelebritiesAPIExtensions
    {
        public static IServiceCollection AddCelebritiesConfiguration(this WebApplicationBuilder builder,
                                                                       string celebrityjson = "Celebrities.config.json")
        {
            builder.Configuration.AddJsonFile(celebrityjson);
            return builder.Services.Configure<CelebritiesConfig>(builder.Configuration.GetSection("Celebrities"));
        }

    }
    public class CelebritiesConfig
    {
        public string PhotosFolder { get; set; }
        public string ConnectionString { get; set; }
        public string PhotosRequestPath { get; set; }
        public string ISO3166alpha2Path { get; set; }  // 2 символьные коды стран
        public CelebritiesConfig()
        {
            this.PhotosRequestPath = "/Photos";
            this.PhotosFolder = "D:\\Study\\university\\TRWP\\lab6\\Photos";
            this.ConnectionString = "Data Source=DESKTOP-0M3BPJP;Initial Catalog=Temp;Integrated Security=True;Trust Server Certificate=True";
            this.ISO3166alpha2Path = "/CountryCodes";

        }
    }
}
