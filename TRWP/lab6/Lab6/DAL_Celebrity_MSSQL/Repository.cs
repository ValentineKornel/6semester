using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL_Celebrity_MSSQL
{
    public class Repository: IRepostory
    {
        Context context;
        public Repository() { this.context = new Context(); }
        public Repository(string connectionString) {
            this.context = new Context(connectionString); 
        }
        public static IRepostory Create() { return new Repository(); }
        public static IRepostory Create(string connectionString) { return new Repository(connectionString); }

        public List<Celebrity> GetAllCelebrities() { return this.context.Celebrities.ToList<Celebrity>(); }
        public Celebrity? GetCelebrityById(int id)
        {
            return this.context.Celebrities.FirstOrDefault(c => c.Id == id);
        }
        public bool AddCelebrity(Celebrity celebrity) 
        {
            this.context.Celebrities.Add(celebrity);
            return this.context.SaveChanges() > 0;
        }
        public bool DeleteCelebrity(int id)
        {
            Celebrity? celebrity = GetCelebrityById(id);
            if (celebrity != null) 
                this.context.Celebrities.Remove(celebrity);
            return this.context.SaveChanges() > 0;
        }
        public bool UpdateCelebrity(int id, Celebrity celebrity)
        {
            Celebrity? existingCelebrity = GetCelebrityById(id);
            if (existingCelebrity != null)
                return existingCelebrity.Update(celebrity);
            return false;
        }

        public List<Lifeevent> GetAllLifeevents() { return this.context.Lifeevents.ToList<Lifeevent>(); }
        public Lifeevent? GetLifeeventById(int id) 
        {
            return this.context.Lifeevents.FirstOrDefault(c => c.Id == id); 
        }
        public bool AddLifeevent(Lifeevent lifeevent)
        {
            this.context.Lifeevents.Add(lifeevent);
            return this.context.SaveChanges() > 0;
        }
        public bool DeleteLifeevent(int id)
        {
            Lifeevent? lifeevent = GetLifeeventById(id);
            if (lifeevent != null)
                this.context.Lifeevents.Remove(lifeevent);
            return this.context.SaveChanges() > 0;
        }
        public bool UpdateLifeevent(int id, Lifeevent lifeevent)
        {
            Lifeevent? existedLifeevent = this.GetLifeeventById(id);
            if(existedLifeevent != null)
                return existedLifeevent.Update(lifeevent);
            return false;
        }
        public List<Lifeevent> GetLifeeventsByCelebrityId(int celebrityId)
        {
            return this.context.Lifeevents.ToList<Lifeevent>().FindAll(l => l.CelebrityId == celebrityId);
        }
        public Celebrity? GetCelebrityByLifeeventId(int lifeeventId)
        {
            Lifeevent? lifeevent = this.GetLifeeventById(lifeeventId);
            if(lifeevent != null)
                return this.GetCelebrityById(lifeevent.CelebrityId);
            return null;
        }
        public int GetCelebrityIdByName(string name)
        {
            Celebrity? celebrity =  this.context.Celebrities.ToList<Celebrity>().FirstOrDefault(c => c.FullName.Contains(name));
            if(celebrity != null)
                return celebrity.Id;
            return -1;
        }
        public void Dispose()
        {
            context.Dispose();
        }
    }
}
