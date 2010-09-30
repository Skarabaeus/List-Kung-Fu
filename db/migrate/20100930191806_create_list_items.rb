class CreateListItems < ActiveRecord::Migration
  def self.up
    create_table :list_items do |t|
      t.text :body
      t.boolean :completed

      t.timestamps
    end
  end

  def self.down
    drop_table :list_items
  end
end
