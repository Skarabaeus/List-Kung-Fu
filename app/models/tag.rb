class Tag < ActiveRecord::Base
  # ASSOCIATIONS

  has_and_belongs_to_many :lists
  belongs_to :user
  #has_and_belongs_to_many :filters

  # VALIDATIONS

  validates_presence_of :name
  validates_presence_of :user_id

  attr_accessible :name, :color_class

end
