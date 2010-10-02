class User < ActiveRecord::Base
   # all lists this user owns.
  has_many :lists, :foreign_key => 'owner_id', :dependent => :destroy

  # all lists this user has access to through other users
  has_and_belongs_to_many :shared_lists, :class_name => 'List'
  
  has_many :filters, :dependent => :destroy

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation
  
  def tags
    all_tags = []
    
    self.all_lists.each do |list|
      all_tags << list.tags
    end
    
    all_tags.flatten
  end
  
  def all_lists
    lists = []
    lists << self.lists << self.shared_lists
    lists.flatten
  end
end
