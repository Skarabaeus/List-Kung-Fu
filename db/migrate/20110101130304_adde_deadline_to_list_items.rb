class AddeDeadlineToListItems < ActiveRecord::Migration
  def self.up
    add_column :list_items, :deadline, :datetime, :null => true
  end

  def self.down
    drop_column :list_items, :deadline
  end
end
