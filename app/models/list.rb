class List < ActiveRecord::Base
  # ASSOCIATIONS

  belongs_to :owner, :class_name => "User" # the owner of the list

  has_and_belongs_to_many :tags
  #has_and_belongs_to_many :users # all users the owner decided to share this list with.

  has_many :list_items, :conditions => 'parent_item_id is NULL', :dependent => :destroy

  # VALIDATIONS

  validates_presence_of :owner
  validates_presence_of :title

  attr_accessible :title

  def tag_helper_color
    red, green, blue = 0, 0, 0

    self.tags.each do |tag|
      red = red + TagsHelper::tag_colors[ tag.color_class.to_sym ].background_color[ 0..1 ].to_i( 16 )
      green = green + TagsHelper::tag_colors[ tag.color_class.to_sym ].background_color[ 2..3 ].to_i( 16 )
      blue = blue + TagsHelper::tag_colors[ tag.color_class.to_sym ].background_color[ 4..5 ].to_i( 16 )
    end

    if tags.length > 0
      mul_factor = 1.3

      red = ( red / ( tags.length * mul_factor ) ).to_i
      green = green / tags.length
      blue = ( blue / ( tags.length * mul_factor ) ).to_i
    else
      red, green, blue = 255, 255, 255
    end

    color = red.to_s(16) + green.to_s(16) + blue.to_s(16)
  end

  def destroy_tag!( tag )
    self.tags.delete( tag )
    self.save
  end

end
