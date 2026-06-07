using System;
using Application.Activities.DTOs;
using Application.Profiles.DTOs;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    // ctor is a shortcut for a constructor
    public MappingProfiles()
    {
        string? currentUserId = null;
        CreateMap<Activity, Activity>();
        CreateMap<CreateActivityDto, Activity>();
        CreateMap<EditActivityDto, Activity>();
        // for the properties that doesn't exist in the both so won't be mapped automatically we need to configure them
        CreateMap<Activity, ActivityDto>()
            //  autmapper will set anything won't found to null by default and it won't through an exception that is why we did !
            .ForMember(d => d.HostDisplayName, o => o.MapFrom(s => s.Attendees.FirstOrDefault(x=> x.IsHost)!.User.DisplayName))
            .ForMember(d => d.HostId, o => o.MapFrom(s => s.Attendees.FirstOrDefault(x=> x.IsHost)!.User.Id));
        CreateMap<ActivityAttendee, UserProfile>()
            .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.User.DisplayName))
            .ForMember(d => d.Bio, o => o.MapFrom(s => s.User.Bio))
            .ForMember(d => d.ImageUrl, o => o.MapFrom(s => s.User.ImageUrl))
            .ForMember(d => d.Id, o => o.MapFrom(s => s.User.Id))
            .ForMember(d => d.Following, o => o.MapFrom(s => s.User.Followers.Any(x => x.ObserverId == currentUserId)))
            .ForMember(d => d.FollowersCount, o => o.MapFrom(s => s.User.Followers.Count))
            .ForMember(d => d.FollowingCount, o => o.MapFrom(s => s.User.Followings.Count));

            // in this to configure the boolean is Following we will pass it as a parameter when using mapper and we will initialize it above
        CreateMap<User, UserProfile>()
            .ForMember(d => d.FollowersCount, o => o.MapFrom(s => s.Followers.Count))
            .ForMember(d => d.FollowingCount, o => o.MapFrom(s => s.Followings.Count))
            .ForMember(d => d.Following, o => o.MapFrom(s => s.Followers.Any(x => x.ObserverId == currentUserId)));
        CreateMap<EditProfileDto, User>();
        CreateMap<Comment, CommentDto>()
            .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.User.DisplayName))
            .ForMember(d => d.ImageUrl, o => o.MapFrom(s => s.User.ImageUrl))
            .ForMember(d => d.Id, o => o.MapFrom(s => s.User.Id));
        CreateMap<Activity, UserActivityDto>();
    }
}
