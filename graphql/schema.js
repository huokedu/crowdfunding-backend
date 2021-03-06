const typeDefinitions = `
scalar Date
scalar DateTime

schema {
  query: RootQuerys
  mutation: RootMutations
}

type RootQuerys {
  me: User
  # required role: supporter
  users(limit: Int!, offset: Int, orderBy: OrderBy, search: String, dateRangeFilter: DateRangeFilter, stringArrayFilter: StringArrayFilter, booleanFilter: BooleanFilter): Users!
  # required role: supporter
  user(id: ID!): User
  roles: [Role!]!

  crowdfundings: [Crowdfunding]
  crowdfunding(name: String!): Crowdfunding!
  pledges: [Pledge!]!
  pledge(id: ID!): Pledge
  draftPledge(id: ID!): Pledge!

  memberships: [Pledge]

  # required role: supporter
  payments(limit: Int!, offset: Int, orderBy: OrderBy, search: String, dateRangeFilter: DateRangeFilter, stringArrayFilter: StringArrayFilter, booleanFilter: BooleanFilter): PledgePayments!
  # required role: supporter
  postfinancePayments(limit: Int!, offset: Int, orderBy: OrderBy, search: String, dateRangeFilter: DateRangeFilter, stringArrayFilter: StringArrayFilter, booleanFilter: BooleanFilter): PostfinancePayments!

  # This exports a CSV containing all payments IN paymentIds
  # required role: accountant
  paymentsCSV(paymentIds: [ID!]): String!

  faqs: [Faq!]!
  events: [Event!]!
  updates: [Update!]!
  testimonials(offset: Int, limit: Int, seed: Float, search: String, firstId: ID, videosOnly: Boolean): [Testimonial!]!
  lastTestimonial: Testimonial!
  nextTestimonial(sequenceNumber: Int!, orderDirection: OrderDirection!): Testimonial!

  membershipStats: MembershipStats!
  testimonialStats: TestimonialStats!
  paymentStats: PaymentStats!

  feeds: [Feed!]!
  feed(name: String!, offset: Int, limit: Int): Feed!

  votings: [Voting!]!
  voting(name: String!): Voting!
}

type RootMutations {
  signIn(email: String!, context: String): SignInResponse!
  signOut: Boolean!
  updateMe(firstName: String, lastName: String, birthday: Date, phoneNumber: String, address: AddressInput): User!
  # required role: supporter
  updateUser(firstName: String, lastName: String, birthday: Date, phoneNumber: String, address: AddressInput, userId: ID!): User!
  # if userId is null, the logged in user's email is changed
  # required role to change other's email: supporter
  updateEmail(userId: ID, email: String!): User!
  # required role: admin
  addUserToRole(userId: ID!, role: Role!): User!
  # required role: admin
  removeUserFromRole(userId: ID!, role: Role!): User!
  # merges the belongings from source to target
  # required role: admin
  mergeUsers(targetUserId: ID!, sourceUserId: ID!): User!

  submitPledge(pledge: PledgeInput): PledgeResponse!
  payPledge(pledgePayment: PledgePaymentInput): PledgeResponse!
  reclaimPledge(pledgeId: ID!): Boolean!
  claimMembership(voucherCode: String!): Boolean!
  # required role: supporter
  cancelPledge(pledgeId: ID!): Pledge!
  # Tries to resolve the amount of a pledge to the total of it's PAID payment.
  # This comes handy if e.g. the payment is off by some cents (foreign wire transfer)
  # and the backoffice decides to not demand an additional wire transfer.
  # Required role: supporter
  resolvePledgeToPayment(pledgeId: ID!, reason: String!): Pledge!
  # required role: supporter
  updatePayment(paymentId: ID!, status: PaymentStatus!, reason: String): PledgePayment!
  # required role: supporter
  updatePostfinancePayment(pfpId: ID!, mitteilung: String!): PostfinancePayment!
  # This imports a CSV exported by PostFinance
  # required role: accountant
  importPostfinanceCSV(csv: String!): String!
  # required role: supporter
  rematchPayments: String!
  # required role: supporter
  sendPaymentReminders(paymentIds: [ID!]!, emailSubject: String): Int!
  # required role: supporter
  hidePostfinancePayment(id: ID!): PostfinancePayment!
  # required role: supporter
  manuallyMatchPostfinancePayment(id: ID!): PostfinancePayment!

  remindEmail(email: String!): Boolean!
  submitQuestion(question: String!): MutationResult

  submitTestimonial(role: String, quote: String!, image: String): Testimonial!
  unpublishTestimonial: Boolean

  submitComment(feedName: String!, content: String!, tags: [String!]): Comment!
  upvoteComment(commentId: ID!): Comment!
  downvoteComment(commentId: ID!): Comment!
  editComment(commentId: ID!, content: String!): Comment!
  unpublishComment(commentId: ID!): Boolean

  submitBallot(optionId: ID!): Boolean!
}


type MutationResult {
  success: Boolean!
}

type SignInResponse {
  phrase: String!
}


input DateRangeFilter {
  field: Field!
  from: DateTime!
  to: DateTime!
}
input StringArrayFilter {
  field: Field!
  values: [String!]!
}
input BooleanFilter {
  field: Field!
  value: Boolean!
}

enum Field {
  createdAt
  updatedAt
  dueDate
  status
  matched
  paperInvoice
  verified
  email
  buchungsdatum
  valuta
  avisierungstext
  gutschrift
  mitteilung
  hrid
  total
  method
  firstName
  lastName
  hidden
}

enum OrderDirection {
  ASC
  DESC
}

input OrderBy {
  field: Field!
  direction: OrderDirection!
}


type User {
  id: ID!
  name: String
  firstName: String
  lastName: String
  email: String!
  address: Address
  birthday: Date
  phoneNumber: String
  createdAt: DateTime!
  updatedAt: DateTime!
  verified: Boolean!

  pledges: [Pledge!]!
  memberships: [Membership!]!
  testimonial: Testimonial

  roles: [String!]
}

type Users {
  items: [User!]!
  count: Int!
}

enum Role {
  admin
  supporter
  accountant
}

type Crowdfunding {
  id: ID!
  name: String!
  beginDate: DateTime!
  endDate: DateTime!
  endVideo: Video
  hasEnded: Boolean!
  goals: [CrowdfundingGoal!]!
  status: CrowdfundingStatus!
  packages: [Package!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
type CrowdfundingGoal {
  money: Int!
  people: Int!
  description: String
}
type CrowdfundingStatus {
  money: Int!
  people: Int!
}

type Package {
  id: ID!
  name: String!
  options: [PackageOption!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PackageOption {
  id: ID!
  package: Package!
  reward: Reward
  minAmount: Int!
  maxAmount: Int
  defaultAmount: Int!
  price: Int!
  minUserPrice: Int!
  userPrice: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  amount: Int
  templateId: ID
}
input PackageOptionInput {
  amount: Int!
  price: Int!
  templateId: ID!
}

type Goodie {
  id: ID!
  name: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type MembershipType {
  id: ID!
  name: String!
  duration: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Membership {
  id: ID!
  type: MembershipType!
  startDate: DateTime
  pledge: Pledge!
  voucherCode: String
  reducedPrice: Boolean!
  claimerName: String
  sequenceNumber: Int
  createdAt: DateTime!
  updatedAt: DateTime!
}

union Reward = Goodie | MembershipType

type Address {
  name: String
  line1: String!
  line2: String
  postalCode: String!
  city: String!
  country: String!
}

input UserInput {
  email: String!
  firstName: String!
  lastName: String!
  birthday: Date
  phoneNumber: String
}
input AddressInput {
  name: String!
  line1: String!
  line2: String
  postalCode: String!
  city: String!
  country: String!
}

enum PledgeStatus {
  DRAFT
  WAITING_FOR_PAYMENT
  PAID_INVESTIGATE
  SUCCESSFUL
  CANCELLED
}
type Pledge {
  id: ID!
  package: Package!
  options: [PackageOption!]!
  status: PledgeStatus!
  total: Int!
  donation: Int!
  payments: [PledgePayment!]!
  user: User!
  reason: String
  memberships: [Membership!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input PledgeInput {
  options: [PackageOptionInput!]!
  total: Int!
  user: UserInput!
  reason: String
}

type PledgeResponse {
  pledgeId: ID
  userId: ID
  emailVerify: Boolean
  pfAliasId: String
  pfSHA: String
}

input PledgePaymentInput {
  pledgeId: ID!
  method: PaymentMethod!
  paperInvoice: Boolean
  sourceId: String
  pspPayload: String
  address: AddressInput
}

enum PaymentMethod {
  STRIPE
  POSTFINANCECARD
  PAYPAL
  PAYMENTSLIP
}
enum PaymentStatus {
  WAITING
  PAID
  WAITING_FOR_REFUND
  REFUNDED
  CANCELLED
}
type PledgePayment {
  id: ID!
  method: PaymentMethod!
  paperInvoice: Boolean!
  total: Int!
  status: PaymentStatus!
  hrid: String
  pspId: String
  dueDate: DateTime
  # every payment should link to
  # a user, but there is some cleanup
  # to do, to make that reality
  user: User
  remindersSentAt: [DateTime!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PledgePayments {
  items: [PledgePayment!]!
  count: Int!
}


type PostfinancePayment {
  id: ID!
  buchungsdatum: Date!
  valuta: Date!
  avisierungstext: String!
  gutschrift: Int!
  mitteilung: String
  matched: Boolean!
  hidden: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PostfinancePayments {
  items: [PostfinancePayment!]!
  count: Int!
}


type Faq {
  category: String
  question: String
  answer: String
}
type Event {
  slug: String
  title: String
  description: String
  link: String
  date: Date
  time: String
  where: String
  locationLink: String
  metaDescription: String
  socialMediaImage: String
}
type Update {
  slug: String
  title: String
  text: String
  publishedDateTime: DateTime
  metaDescription: String
  socialMediaImage: String
}

enum ImageSize {
  SHARE
}

type Testimonial {
  id: ID!
  name: String!
  role: String
  quote: String
  video: Video
  # 384x384 JPEG HTTPS URL
  image(size: ImageSize): String!
  smImage: String
  published: Boolean
  adminUnpublished: Boolean
  sequenceNumber: Int
}

type Video {
  hls: String!
  mp4: String!
  youtube: String
  subtitles: String
  poster: String
}


type MembershipStats {
  count: Int!
  createdAts(interval: TimeInterval!): [TimeCount!]!
  ages: [AgeCount!]!
  countries: [CountryCount!]!
}

enum TimeInterval {
  hour
  day
  week
  month
  quarter
  year
}

type TimeCount {
  datetime: DateTime!
  count: Int!
}
type AgeCount {
  age: Int
  count: Int!
}
type CountryCount {
  name: String
  count: Int!
  states: [StateCount!]!
  postalCodes: [PostalCodeCount!]!
}
type StateCount {
  name: String
  abbr: String
  count: Int!
}
type PostalCodeCount {
  postalCode: String
  name: String
  lat: Float!
  lon: Float!
  count: Int!
}


type TestimonialStats {
  count: Int!
  eligitable: Int!
}


type PaymentStats {
  paymentMethods: [PaymentMethodCount!]!
}

type PaymentMethodCount {
  method: PaymentMethod!
  count: Int!
  details: [DetailCount!]!
}
type DetailCount {
  detail: String
  count: Int!
}

enum OrderType {
  HOT
  NEW
  TOP
}

type Feed {
  id: ID!
  name: String!
  # comments in this feed.
  # firstId is always the first object if it exists
  # tags: null - no filter, [] - no tags, ["DATA"] - only DATA tagged objects
  comments(offset: Int, limit: Int, firstId: ID, tags: [String!], order: OrderType): [Comment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  userIsEligitable: Boolean!
  # user must wait until that date to submit a new comment
  userWaitUntil: DateTime
  # max length in chars of comment content
  commentMaxLength: Int!
  # waiting time to submit a new comment (in milliseconds)
  commentInterval: Int!
  stats: FeedStats!
}
type FeedStats {
  count: Int!
  tags: [TagCount!]!
}
type TagCount {
  tag: String
  count: Int!
}


enum CommentVote {
  UP
  DOWN
}
type Comment {
  id: ID!
  content: String!
  tags: [String!]!
  authorName: String!
  authorImage(size: ImageSize): String
  smImage: String
  upVotes: Int!
  downVotes: Int!
  # score based on votes
  score: Int!
  # reddit's hottnes
  hottnes: Float!
  # vote of the signedIn user (null - no vote)
  userVote: CommentVote
  userCanEdit: Boolean
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Voting {
  id: ID!
  name: String!
  beginDate: DateTime!
  endDate: DateTime!
  options: [VoteOption!]!
  turnout: VoteTurnout!
  result: VoteResult
  # current user (me) is eligitable to submit a ballot
  userIsEligitable: Boolean
  # current user (me) has submitted a ballot
  userHasSubmitted: Boolean
}
type VoteTurnout {
  eligitable: Int!
  submitted: Int!
}
type VoteOption {
  id: ID!
  name: String!
}
type VoteOptionResult {
  id: ID!
  name: String!
  count: Int!
  winner: Boolean
}
type VoteResult {
  options: [VoteOptionResult!]!
  stats: VoteStats!
  message: String
  video: Video
  createdAt: DateTime
  updatedAt: DateTime
}
type VoteStats {
  ages: [VoteStatsCount!]!
  countries: [VoteStatsCount!]!
  chCantons: [VoteStatsCount!]!
}
type VoteStatsCount {
  key: String!
  count: Int!
  options: [VoteOptionResult!]!
}

`
module.exports = [typeDefinitions]
