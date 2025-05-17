package utils

const (
	// Common errors
	ErrMsgDBConnectionFailed = "Failed to connect to the database."
	ErrMsgNoProjectAccess    = "No access rights for the specified project."
	ErrMsgRecordReferenced   = "The record is referenced by other records."
	ErrMsgDeleteRecordFailed = "Error deleting the record."

	// Helper errors
	ErrMsgCannotRetrieveProjectID  = "Could not retrieve project ID from query."
	ErrMsgInvalidProjectIdentifier = "Invalid type for projectIdentifier."
	ErrMsgAccessCheckFailed        = "Error checking access rights."
	ErrMsgEmailCredentialsNotSet   = "EMAIL_FROM or EMAIL_PASS is not set."

	// HandleDelete specific
	ErrMsgPreDeleteQueryFailed = "Error executing preparatory delete query."

	// HandleGet & HandleGetWithProjectIDs specific
	ErrMsgDBQueryFailed             = "Error executing database query."
	ErrMsgScanFailed                = "Error scanning database results."
	ErrMsgRowsReadFailed            = "Error reading rows from database."
	ErrMsgInvalidProjectIDParam     = "Invalid project_id parameter."
	ErrMsgNoPermissionForProjectIDs = "No permission for specified project IDs."
	ErrMsgProcessingRequest         = "Error when processing the request."

	ErrMsgErrorCheckingUser           = "Error checking the user."
	ErrMsgErrorCheckingRoleAssignment = "Error checking role assignment."
	ErrMsgErrorFetchingCurrentRole    = "Error fetching current role."

	// HandleInsert specific
	ErrMsgInsertRecordFailed = "Error inserting the record."
	ErrMsgInvalidRequestBody = "Invalid request body."

	// HandleUpdate specific
	ErrMsgUpdateRecordFailed = "Error updating the record."
	ErrMsgErrorUpdatingRole  = "Error updating the role."

	// Permissions specific
	ErrMsgNoPermission            = "No permission for this project."
	ErrMsgAdminCannotBeDegraded   = "Admin rights cannot be revoked."
	ErrMsgAdminCannotGrantCreator = "Admin cannot grant creator rights."
	ErrMsgUserCannotModify        = "User cannot modify roles."
	ErrMsgSelfDelegation          = "Cannot change own role."

	// Token specific
	ErrMsgTokenMissing          = "Token missing."
	ErrMsgInvalidTokenFormat    = "Invalid token format."
	ErrMsgInvalidToken          = "Invalid token."
	ErrMsgTokenExpiredOrInvalid = "Token expired or invalid."
	ErrMsgTokenExpired          = "Token expired."
	ErrMsgCreateToken           = "Error creating the token."
	ErrMsgInvalidIssuer         = "Invalid token issuer."

	// Parameter specific
	ErrMsgIdMissing          = "Could not retrieve ID from query."
	ErrMsgEmailMissing       = "Could not retrieve email from query."
	ErrMsgRangeMissing       = "Could not retrieve range parameter from query."
	ErrMsgIdInvalid          = "Invalid ID format."
	ErrMsgDobInvalid         = "“Invalid date of birth”."
	ErrMsgIDMissingOrInvalid = "ID is missing or invalid."

	// CORS specific
	ErrMsgMethodNotAllowed = "Method Not Allowed."
	ErrMsgPostOnly         = "Only POST method allowed."
	ErrMsgMethodPUTOnly    = "Only PUT method allowed."
)
