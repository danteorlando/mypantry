using System.Data.Entity.ModelConfiguration;
using MyPantry.Model;

namespace MyPantry.DataAccess
{
    public class PantryItemConfiguration : EntityTypeConfiguration<PantryItem>
    {
        public PantryItemConfiguration()
        {
        }
    }
}
