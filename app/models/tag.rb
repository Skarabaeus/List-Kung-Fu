class Tag < ActiveRecord::Base
  # ASSOCIATIONS
  
  has_and_belongs_to_many :lists
  has_and_belongs_to_many :filters
  
  # VALIDATIONS
  
  validates_presence_of :name
  
  attr_accessible :name
  
end
