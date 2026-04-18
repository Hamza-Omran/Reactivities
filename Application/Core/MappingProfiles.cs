using System;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    // ctor is a shortcut for a constructor
    public MappingProfiles()
    {
        CreateMap<Activity, Activity>();
    }
}
