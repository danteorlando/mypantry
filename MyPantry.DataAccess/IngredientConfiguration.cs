using System.Data.Entity.ModelConfiguration;
using MyPantry.Model;

namespace MyPantry.DataAccess
{
    public class IngredientConfiguration : EntityTypeConfiguration<Ingredient>
    {
        public IngredientConfiguration()
        {
            // Session has 1 Speaker, Speaker has many Session records
            /*
            HasRequired(s => s.Speaker)
               .WithMany(p => p.SpeakerSessions)
               .HasForeignKey(s => s.SpeakerId);
               */
        }
    }
}
