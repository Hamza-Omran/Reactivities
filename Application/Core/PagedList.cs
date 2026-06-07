using System;

namespace Application.Core;

// in our project the cursor (which keeps the place where we stopped) is going to be a date type but we will make it generic so
// we can use it for any type of lists that might need different cursor type
public class PagedList<T, TCursor>
{
    public List<T> Items { get; set; } = [];
    public TCursor? NextCursor { get; set; }
}
