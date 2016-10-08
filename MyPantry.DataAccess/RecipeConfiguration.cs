using System.Data.Entity.ModelConfiguration;
using MyPantry.Model;

namespace MyPantry.DataAccess
{
    public class RecipeConfiguration : EntityTypeConfiguration<Recipe>
    {
        public RecipeConfiguration()
        {
        }
    }
}
