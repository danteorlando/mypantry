
using System.Collections.Generic;

namespace MyPantry.Model
{
    public class Ingredient
    {

        public int Id { get; set; }
        
        public string Name { get; set; }

        public string Description { get; set; }

        public string ImageSource { get; set; }

        public virtual ICollection<PantryItem> PantryItems { get; set; }

    }
}
