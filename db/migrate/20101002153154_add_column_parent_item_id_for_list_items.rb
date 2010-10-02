class AddColumnParentItemIdForListItems < ActiveRecord::Migration
  def self.up
    add_column :list_items, :parent_item_id, :integer
  end

  def self.down
    remove_column :list_items, :parent_item_id
  end
end
