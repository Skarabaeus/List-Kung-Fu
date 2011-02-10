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

  def foreground_color_rgb
    (TagsHelper::tag_colors[ self.color_class.to_sym ]).foreground_color
  end

  def color_rgb
    (TagsHelper::tag_colors[ self.color_class.to_sym ]).background_color
  end

  private

  def remove_tag_from_all_lists
    self.lists.clear
    self.save
  end

end
