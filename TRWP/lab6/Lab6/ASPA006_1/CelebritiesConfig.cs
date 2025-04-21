namespace ASPA006_1
{
    public class CelebritiesConfig
    {
        public string PhotosFolder { get; set; }
        public string ConnectionString {  get; set; }
        public string PhotosRequestPath {  get; set; }
        public CelebritiesConfig() 
        {
            this.PhotosRequestPath = "/Photos";
            this.PhotosFolder = "D:\\Study\\university\\TRWP\\lab6\\Photos";
            this.ConnectionString = "Data Source=DESKTOP-0M3BPJP;Initial Catalog=Temp;Integrated Security=True;Trust Server Certificate=True";
        }

    }
}
