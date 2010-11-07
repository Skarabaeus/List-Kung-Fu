class ChangeColumnListItemCompleted < ActiveRecord::Migration
  def self.up
    change_column :list_items, :completed, :boolean, :null => false, :default => false
  end

  def self.down
    change_column :list_items, :completed, :boolean, :null => true
  end
end
