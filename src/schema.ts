// anothe one --------------------------------------------------------------

//   Table users{

//     id ObjectId [pk]

//     profileId string

//     email string

//     role enum('admin', 'user', 'superAdmin ')

//     phone string

//     password string

//     passwordChangedAt  Date

//     isBlocked  boolean

//     verifyCode number

//     resetCode number

//     isVerified boolean

//     isResetVerified boolean

//     codeExpireIn Date

//     isActive boolean

//     isDeleted boolean

//     appleId string

//     googleId string

// }

//  Table normalusers {

//   id ObjectId [pk]

//   user ObjectId [ref: > users.id]

//   username string

//   name string

//   email string

//   phone string

//   facebookLink string
//   instagramLink string

//   skills ObjectId[] [ref:> SkillCategory.id]
//   address string
//   bio string

//   bondRatingCount number
//   totalBondRating number

//   recomandedSkillPeoples ObjectId[] [ref:> SkillPeople.id]

//   profile_image string
//   cover_image string
//   createdAt Date
//   updatedAt Date

// }

// Table FriendRequest {
//     id ObjectId [pk]
//     sender ObjectId [ref:> normalusers.id]
//     receiver ObjectId [ref:> normalusers.id]
//     status enum("accepted","pending","rejected")
//     createdAt Date
//     updatedAt Date
// }

// Table Relatives  {
//   id ObjectId [pk]
//   relative ObjectId [ref:> normalusers.id]
//   relativeType string
//   createdAt Date
//   updatedAt Date
// }

// Table SkillPeople {
//   id ObjectId [pk]
//   name string
//   profession string
//   phone string
// }

// Table superadmins {

//   id ObjectId [pk]

//   user ObjectId [ref:>users.id,unique]

//   name string

//   email string

//   profile_image string

//   createdAt Date
//   updatedAt Date

// }

// Table admins {

//   id ObjectId [pk]

//   user ObjectId [ref:>users.id]

//   name string

//   email string

//   profile_image string

//   isActive boolean

//   createdAt Date
//   updatedAt Date

// }

// Table Donner {

//   id ObjectId [pk]

//   user ObjectId [ref:> normalusers.id]

//   amount number
//   createdAt Date
//   updatedAt Date
// }

// Table Audiotopic {

//   id ObjectId [pk]

//   name string

//   image string
//   createdAt Date
//   updatedAt Date
// }

// Table SkillCategory {

//   id ObjectId [pk]

//   name string

//   image string
//   createdAt Date
//   updatedAt Date
// }

// Table Audio {

//   id ObjectId [pk]

//   audioTopic ObjectId [ref:> Audiotopic.id]

//   title string

//   cover_image string

//   totalPlay number

//   duration number
//   createdAt Date
//   updatedAt Date

// }

// Table playlists {

//   id ObjectId [pk]

//   name string

//   description string

//   tags string[]

//   cover_image string

//   audios Object[] [ref:> Audio.id]

//   totalDuration number
//   createdAt Date
//   updatedAt Date
// }

// Table AudioBookmark {

//   id ObjectId [pk]

//   audio ObjectId [ref:> Audio.id]

//   user ObjectId [ref:> normalusers.id]
//   createdAt Date
//   updatedAt Date
// }

// Table AudioRating {

//   id ObjectId [pk]

//   audio ObjectId [ref:> Audio.id]

//   user ObjectId [ref:> normalusers.id]

//   comment string

//   rating number
//   createdAt Date
//   updatedAt Date
// }

// Table Project {

//   id ObjectId

//   name string

//   description string

//   cover_image string

//   isPublic boolean

//   joinControll enum("Public","Private")

//   ower ObjectId [ref:> normalusers.id]

//   status enum("Ongoing","Canceled","Completed")
//   createdAt Date
//   updatedAt Date
// }

// Table ProjectMumber {

//   id ObjectId [pk]

//   user ObjectId [ref:> normalusers.id]

//   project ObjectId [ref:> normalusers.id]

//   type enum('Producer','Consumer')

//   role string
//   createdAt Date
//   updatedAt Date
// }

// Table ProjectJoinRequest {

//   id ObjectId [pk]

//   user ObjectId [ref:> normalusers.id]

//   project ObjectId [ref:> normalusers.id]

//   status  enum("pending",'rejected','accepted')
//   createdAt Date
//   updatedAt Date
// }

// Table ProjectDocument {

//   id ObjectId [pk]

//   addedBy ObjectId [ref:> normalusers.id]

//   project ObjectId [ref:> Project.id]

//   document_url string
//   createdAt Date
//   updatedAt Date
// }

// Table ProjectImage {

//   id ObjectId [pk]

//   addedBy ObjectId [ref:> normalusers.id]

//   project ObjectId [ref:> Project.id]

//   image_url string
//   createdAt Date
//   updatedAt Date
// }

//  Table Bond {

//   id ObjectId [pk]

//   user ObjectId [ref:> normalusers.id]

//   offer string

//   want string

//   tag string
//   createdAt Date
//   updatedAt Date

//  }

// Table BondRequest {
//   id ObjectId [pk]
//   user ObjectId [ref:> normalusers.id]
//   give string
//   get string
//   location string
//   radius number
//   createdAt Date
//   updated Date
// }

// Table Report {

//   reportFrom ObjectId [ref:>normalusers.id]

//   reportTo ObjectId  [ref:> normalusers.id]

//   type string

//   descripton string
//   createdAt Date
//   updatedAt Date
// }

// Table TermsAndCondition {

//   id ObjectId [pk]

//   description string

// }

// Table PrivacyPolicy {

//   id ObjectId [pk]

//   description string
//   createdAt Date
//   updatedAt Date
// }

// Table FAQ {

//   id ObjectId [pk]

//   question string

//   answer string
//   createdAt Date
//   updatedAt Date
// }

// Table Institution {

//   id ObjectId [pk ]
//   name string
//   description string
//   groupOneName string
//   groupTwoName string
//   facebookLink string
//   instagramLink string
//   creator ObjectId [ref:> normalusers.id]
//   createdAt Date
//   updatedAt Date
// }

// Table InstitutionMumber {
//   id ObjectId [pk]
//   group enum('a','b')
//   user OjbectId [ref:> normalusers.id]
//   createdAt Date
//   updatedAt Date
// }

// Table InstitutionConversation {
//   id OjbectId [pk]
//   name string
//   isPublic boolean
//   ussers OjbectId[] [ref:> normalusers.id]
//   likers OjbectId[] [ref:> normalusers.id]
//   createdAt Date
//   updatedAt Date
// }

// Table ConversationComment {
//   id ObjectId [pk]
//   institutionConversation OjbectId [ref:> InstitutionConversation.id]
//   comment string
//   likers OjbectId[] [ref:> normalusers.id]
//   createdAt Date
//   updated Date
// }

// Table Transaction {
//   id ObjectId [pk]
//   user ObjectId [ref:> normalusers.id]
//   type string
//   amount number
//   transactionId string
//   createdAt Date
//   updatedAt Date
// }

// Table Conversation {
//   id ObjectId [pk]
//   participants ObjectId[] [ref:> normalusers.id]
//   lastMessage ObjectId [ref:> Message.id]
//   type enum("one-to-one","group")
//   institution ObjectId [ref: > Institution.id] // nullable
//   project OjbectId [ref:> Project.id] // nullable
//   chatGroup OjbectId [ref:> ChatGroup.id] // nullable
//   createdAt Date
//   updatedAt Date
// }

// Table Message {
//   id OjbectId [pk]
//   text string
//   imageUrls string[]
//   videoUrls string[]
//   pdfUrls string[]
//   sender ObjectId [ref:> normalusers.id]
//   seenBy ObjectId[] [ref:> normalusers.id]
//   conversationId ObjectId [ref:> Conversation.id]
//   createdAt Date
//   updatedAt Date
// }

// Table ChatGroup {
//   id ObjectId [pk]
//   name string
//   coverImage string
//   mumbers ObjectId[] [ref:> normalusers.id]
//   createdAt Date
//   updatedAt Date
// }

// Table Bonding {
//   id ObjectId [pk]
//   name string
//   coverImage string
//   joinControll string
//   isPublic boolean
//   creator ObjectId [ref:> normalusers.id]
//   createdAt Date
//   updatedAt Date
// }
