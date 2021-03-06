class User < ActiveRecord::Base
   # all lists this user owns.
  has_many :lists, :foreign_key => 'owner_id', :dependent => :destroy
  has_many :filters, :dependent => :destroy
  has_many :tags

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :confirmable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :encryptable, :encryptor => :authlogic_sha512

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :username, :time_zone, :email_dashboard

  validates_uniqueness_of :username

end
