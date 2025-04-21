namespace DAL003
{
    public class Celebrity
    {
        public int Id { get; set; }
        public string Firstname { get; set; }
        public string Surname { get; set; }
        public string PhotoPath { get; set; }
        public Celebrity(int id, string firstname, string surname, string photopath) { 
            Id = id;
            Firstname = firstname;
            Surname = surname;
            PhotoPath = photopath;
        }
    }
}
