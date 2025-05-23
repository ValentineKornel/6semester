using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL_Celebrity_MSSQL
{
    internal class Context : DbContext
    {

        public string? ConnectionString { get; private set; } = null;
        public Context(string ? connectionString)
        {
            ConnectionString = connectionString;
        }
        public Context() : base() { }
        public DbSet<Celebrity> Celebrities { get; set; }
        public DbSet<Lifeevent> Lifeevents { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (this.ConnectionString is null) this.ConnectionString = "Data Source=DESKTOP-0M3BPJP;Initial Catalog=Temp;Integrated Security=True;Trust Server Certificate=True";
            optionsBuilder.UseSqlServer(this.ConnectionString);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Celebrity>().ToTable("Celebrities").HasKey(p => p.Id);
            modelBuilder.Entity<Celebrity>().Property(p => p.Id).IsRequired();
            modelBuilder.Entity<Celebrity>().Property(p => p.FullName).IsRequired().HasMaxLength(50);
            modelBuilder.Entity<Celebrity>().Property(p => p.Nationality).IsRequired().HasMaxLength(2);
            modelBuilder.Entity<Celebrity>().Property(p => p.ReqPhotoPath).HasMaxLength(200);

            modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents").HasKey(l => l.Id);
            modelBuilder.Entity<Lifeevent>().Property(l => l.Id).IsRequired();
            modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents").HasOne<Celebrity>().WithMany().HasForeignKey(l => l.CelebrityId);
            modelBuilder.Entity<Lifeevent>().Property(l => l.CelebrityId).IsRequired();
            modelBuilder.Entity<Lifeevent>().Property(l => l.Date);
            modelBuilder.Entity<Lifeevent>().Property(l => l.Description).HasMaxLength(256);
            modelBuilder.Entity<Lifeevent>().Property(l => l.ReqPhotoPath).HasMaxLength(256);
            base.OnModelCreating(modelBuilder);
        }
    }
}
    