import { langInterface } from "../common/types";

let langFile : langInterface = {
    logger_is_not_a_function : 'Logger Should Be a function',
    run_on_success_is_not_a_function : 'Run On Success Is Not A Function',
    success_must_be_function_or_object : 'Success Must Be A Function Or An Object',
    success_must_have_a_method_with_name_run : 'Success Must Have A Method With Name Run',
    error_handler_is_not_a_function : 'Error Handler Must Be A Function',
    method_must_be_one_of : '%s method is not accepted, Fetch Method Must Be One Of the GET, POST, PULL, PUSH, DELETE,PATCH',
    network_unavailable : 'Network Is Unavailable',
    unknown_error : 'Unknown Error Happen',
}
export default langFile;