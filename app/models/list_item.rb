class ListItem < ActiveRecord::Base
  # ASSOCIATIONS

  belongs_to :list
  belongs_to :parent_item, :class_name => 'ListItem'
  has_many :children_items, :class_name => 'ListItem', :foreign_key => 'parent_item_id', :dependent => :destroy

  # VALIDATIONS

  validates_presence_of :list

  # CALLBACKS
  after_initialize :body_rendered

  attr_accessible :body, :completed

  private

  def body_rendered
    write_attribute( :body_rendered, RedCloth.new( self.body ).to_html )
  end
end
