class ListItem < ActiveRecord::Base
  # ASSOCIATIONS

  belongs_to :list
  
  # for now not supporting this, because I'm not yet pursuated that
  # this feature is really needed. simple todo lists are more likely
  # to be actually used.
  # keeping the parent_id field in the DB for now, might drop that later.
  #belongs_to :parent_item, :class_name => 'ListItem'
  #has_many :children_items, :class_name => 'ListItem', :foreign_key => 'parent_item_id', :dependent => :destroy

  # VALIDATIONS

  validates_presence_of :list

  # CALLBACKS
  after_initialize :body_rendered

  attr_accessible :body, :completed

  # public functions

  def saved?
    !self.id.nil?
  end

  private

  def body_rendered
    write_attribute( :body_rendered, RedCloth.new( self.body ).to_html ) unless self.body.nil?
  end
end
