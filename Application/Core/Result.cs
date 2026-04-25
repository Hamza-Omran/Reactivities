using System;

namespace Application.Core;

// we will use generic type so we use it for anything on our handler
// now we don't need to make all our crud in activity to use Result
public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T? Value { get; set; }
    public string? Error { get; set; }
    public int Code { get; set; }
    
    
    public static Result<T> Success(T value) => new() {IsSuccess = true, Value = value}; // we created an object and did the function in one line
    public static Result<T> Failure(string error, int code) => new() {IsSuccess = false, Error = error, Code = code};


}
