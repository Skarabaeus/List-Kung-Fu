class AddColorClassToTags < ActiveRecord::Migration
  def self.up
    add_column :tags, :color_class, :string
  end

  def self.down
    drop_column :tags, :color_class
  end
end
