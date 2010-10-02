class AddColumnListIdToListItems < ActiveRecord::Migration
  def self.up
    add_column :list_items, :list_id, :integer
  end

  def self.down
    remove_column :list_items, :list_id
  end
end
