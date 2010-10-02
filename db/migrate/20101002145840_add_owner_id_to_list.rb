class AddOwnerIdToList < ActiveRecord::Migration
  def self.up
    add_column :lists, :owner_id, :integer
  end

  def self.down
    remove_column :lists, :owner_id
  end
end
