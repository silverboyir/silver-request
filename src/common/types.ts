import CacheInterface from "../CacheHandlers/CacheInterface";

export interface SuccessObject {
    run : (s : object) => null;
}

export interface CacheInterfaceConstructable {
    new() : CacheInterface
}

export interface langInterface {
    logger_is_not_a_function : string,
    run_on_success_is_not_a_function : string,
    success_must_be_function_or_object : string,
    success_must_have_a_method_with_name_run : string,
    error_handler_is_not_a_function : string,
    method_must_be_one_of : string,
    network_unavailable : string,
    unknown_error : string,
}

export interface langDictionary {
    [index : string] : langInterface
}