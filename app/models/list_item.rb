class ListItem < ActiveRecord::Base
  # ASSOCIATIONS
  
  belongs_to :list
  belongs_to :parent_item, :class_name => 'ListItem'
  has_many :children_items, :class_name => 'ListItem', :foreign_key => 'parent_item_id', :dependent => :destroy
  
  # VALIDATIONS
  
  validates_presence_of :list
  
  attr_accessible :body, :completed
end
