class Filter < ActiveRecord::Base
  # ASSOCIATIONS

  belongs_to :user
  has_and_belongs_to_many :tags
  
  # VALIDATIONS
  
  validates_presence_of :user
  validates_presence_of :name

  attr_accessible :name, :searchtext
end
