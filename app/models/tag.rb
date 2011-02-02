class Tag < ActiveRecord::Base
  # ASSOCIATIONS

  has_and_belongs_to_many :lists
  belongs_to :user
  #has_and_belongs_to_many :filters

  # VALIDATIONS

  validates_presence_of :name
  validates_presence_of :user_id

  # CALLBACKS

  before_destroy :remove_tag_from_all_lists

  attr_accessible :name, :color_class

  private

  def remove_tag_from_all_lists
    self.lists.clear
    self.save
  end

end
