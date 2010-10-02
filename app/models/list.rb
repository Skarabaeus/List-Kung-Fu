class List < ActiveRecord::Base
  # ASSOCIATIONS
  
  belongs_to :owner, :class_name => "User" # the owner of the list
  
  has_and_belongs_to_many :tags
  has_and_belongs_to_many :users # all users the owner decided to share this list with.
  
  has_many :list_items, :conditions => 'parent_item_id is NULL', :dependent => :destroy
  
  # VALIDATIONS
  
  validates_presence_of :owner
  validates_presence_of :title
  
  
  attr_accessible :title
end
