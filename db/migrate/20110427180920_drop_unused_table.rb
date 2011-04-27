class DropUnusedTable < ActiveRecord::Migration
  def self.up
    drop_table :filters
    drop_table :filters_tags
    drop_table :lists_users
  end

  def self.down
    # these tables have never been used. Therefore it doesn't really make sense 
    # to add create scripts here.
  end
end
